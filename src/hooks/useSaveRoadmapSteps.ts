import { useMutation, useQueryClient } from '@tanstack/react-query'

import { connectionsApi } from '@/lib/api/connections'
import { roadmapKeys } from '@/lib/api/queryKeys'
import { stepsApi } from '@/lib/api/steps'
import {
  collectNewFlowConnections,
  collectNewResourcesForExistingSteps,
  collectNewStepsForCreate,
  collectStepsForUpdate,
  seedNodeIdToStepIdMap,
  type NewStepForCreate,
} from '@/lib/flow/mapRoadmapToFlow'
import type { LocalRoadmapState } from '@/types/roadmap'

type SaveRoadmapStepsInput = {
  slug: string
  state: LocalRoadmapState
  baseline: LocalRoadmapState
}

function resolveParentStepId(
  step: NewStepForCreate,
  nodeIdToStepId: Map<string, number>,
  state: LocalRoadmapState,
): number {
  if (step.stepKind === 'main') {
    throw new Error('Main steps do not have a parent step.')
  }

  if (!step.parentNodeId) {
    throw new Error('Sub step is missing a parent node reference.')
  }

  const mappedParentId = nodeIdToStepId.get(step.parentNodeId)
  if (mappedParentId) {
    return mappedParentId
  }

  const parentNode = state.nodes.find((node) => node.id === step.parentNodeId)
  if (parentNode?.data.stepId) {
    return parentNode.data.stepId
  }

  throw new Error('Parent step must be saved before its sub steps.')
}

export function useSaveRoadmapSteps() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ slug, state, baseline }: SaveRoadmapStepsInput) => {
      const newSteps = collectNewStepsForCreate(state)
      const stepsToUpdate = collectStepsForUpdate(state, baseline)
      const newResourcesForExistingSteps =
        collectNewResourcesForExistingSteps(state)
      const nodeIdToStepId = seedNodeIdToStepIdMap(state)
      const pendingConnections = collectNewFlowConnections(state, nodeIdToStepId)

      if (
        newSteps.length === 0 &&
        stepsToUpdate.length === 0 &&
        newResourcesForExistingSteps.length === 0 &&
        pendingConnections.length === 0
      ) {
        return {
          createdStepCount: 0,
          updatedStepCount: 0,
          createdConnectionCount: 0,
        }
      }

      const mainSteps = newSteps.filter((step) => step.stepKind === 'main')
      const subSteps = newSteps.filter((step) => step.stepKind === 'sub')

      for (const step of mainSteps) {
        const created = await stepsApi.create(slug, {
          parent: null,
          title: step.title,
          content: step.content,
          priority: step.priority,
          position_x: step.position_x,
          position_y: step.position_y,
        })

        nodeIdToStepId.set(step.nodeId, created.id)

        for (const resource of step.resources) {
          await stepsApi.createResource(slug, created.id, {
            title: resource.title,
            description: resource.description,
            url: resource.url,
            resource_type: resource.resource_type,
            is_free: resource.is_free,
          })
        }
      }

      for (const step of subSteps) {
        const parentId = resolveParentStepId(step, nodeIdToStepId, state)
        const created = await stepsApi.create(slug, {
          parent: parentId,
          title: step.title,
          content: step.content,
          priority: step.priority,
          position_x: step.position_x,
          position_y: step.position_y,
        })

        nodeIdToStepId.set(step.nodeId, created.id)

        for (const resource of step.resources) {
          await stepsApi.createResource(slug, created.id, {
            title: resource.title,
            description: resource.description,
            url: resource.url,
            resource_type: resource.resource_type,
            is_free: resource.is_free,
          })
        }
      }

      if (stepsToUpdate.length > 0) {
        await stepsApi.bulkUpdate(slug, {
          steps: stepsToUpdate.map(({ stepId, input }) => ({
            id: stepId,
            ...input,
          })),
        })
      }

      for (const entry of newResourcesForExistingSteps) {
        await stepsApi.createResource(slug, entry.stepId, entry.resource)
      }

      const connectionsToCreate = collectNewFlowConnections(state, nodeIdToStepId)

      for (const connection of connectionsToCreate) {
        await connectionsApi.create(slug, {
          from_step: connection.from_step,
          to_step: connection.to_step,
        })
      }

      return {
        createdStepCount: newSteps.length,
        updatedStepCount: stepsToUpdate.length,
        createdConnectionCount: connectionsToCreate.length,
      }
    },
    onSuccess: async (_data, variables) => {
      await queryClient.refetchQueries({
        queryKey: roadmapKeys.detail(variables.slug),
      })
    },
  })
}
