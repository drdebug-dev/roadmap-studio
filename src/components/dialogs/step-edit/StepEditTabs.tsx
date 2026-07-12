import { ContentTab } from '@/components/dialogs/step-edit/ContentTab'
import { ExercisesTab } from '@/components/dialogs/step-edit/ExercisesTab'
import { QuizzesTab } from '@/components/dialogs/step-edit/QuizzesTab'
import { ResourcesTab } from '@/components/dialogs/step-edit/ResourcesTab'
import {
  type ActiveTab,
  useStepEditContext,
} from '@/components/dialogs/step-edit/StepEditContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function StepEditTabs() {
  const {
    activeTab,
    setActiveTab,
    exerciseCount,
    quizCount,
    selectedSlug,
  } = useStepEditContext()

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as ActiveTab)}
    >
      <TabsList>
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="resources">Resources</TabsTrigger>
        <TabsTrigger value="exercises">
          Exercises{exerciseCount > 0 ? ` (${exerciseCount})` : ''}
        </TabsTrigger>
        <TabsTrigger value="quizzes">
          Quizzes{quizCount > 0 ? ` (${quizCount})` : ''}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="space-y-4 pt-2">
        <ContentTab />
      </TabsContent>

      <TabsContent value="resources" className="space-y-2 pt-2">
        <ResourcesTab />
      </TabsContent>

      <TabsContent value="exercises" className="space-y-2 pt-2">
        {selectedSlug ? (
          <ExercisesTab />
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a roadmap before managing exercises.
          </p>
        )}
      </TabsContent>

      <TabsContent value="quizzes" className="space-y-2 pt-2">
        {selectedSlug ? (
          <QuizzesTab />
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a roadmap before managing quizzes.
          </p>
        )}
      </TabsContent>
    </Tabs>
  )
}
