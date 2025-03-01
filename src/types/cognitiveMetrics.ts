// Base metric types
export interface BaseMetric {
  timestamp: number;
  value: number;
}

// Memory Match Metrics
export interface MemoryMatchMetrics {
  Memory_Recall_Accuracy: BaseMetric;
  Short_Term_Memory_Retention: BaseMetric;
  Sequential_Memory_Accuracy: BaseMetric;
  Memory_Decay_Rate: BaseMetric;
  Verbal_Working_Memory_Score: BaseMetric;
  Working_Memory_Span: BaseMetric;
  N_Back_Task_Performance: BaseMetric;
  Auditory_Working_Memory: BaseMetric;
}

// Stroop Challenge Metrics
export interface StroopChallengeMetrics {
  Reaction_Time: BaseMetric;
  Selective_Attention_Score: BaseMetric;
  Distractibility_Index: BaseMetric;
  Attention_Shift_Accuracy: BaseMetric;
  Impulse_Control_Score: BaseMetric;
  Inhibitory_Control_Accuracy: BaseMetric;
  Sustained_Attention_Duration: BaseMetric;
}

// Pattern Puzzler Metrics
export interface PatternPuzzlerMetrics {
  Pattern_Recognition_Accuracy: BaseMetric;
  Logical_Reasoning_Accuracy: BaseMetric;
  Hypothesis_Testing_Score: BaseMetric;
  Abstract_Thinking_Score: BaseMetric;
  Trial_and_Error_Ratio: BaseMetric;
  Causal_Inference_Ability: BaseMetric;
  Problem_Solving_Steps_Taken: BaseMetric;
  Cognitive_Problem_Formulation: BaseMetric;
}

// Spatial Navigator Metrics
export interface SpatialNavigatorMetrics {
  Spatial_Rotation_Accuracy: BaseMetric;
  Mental_Rotation_Speed: BaseMetric;
  Navigation_Error_Rate: BaseMetric;
  Spatial_Problem_Solving: BaseMetric;
  Fine_Motor_Skills: BaseMetric;
  Cognitive_Working_Capacity: BaseMetric;
}

// Tower of Planning Metrics
export interface TowerPlanningMetrics {
  Backtracking_Moves: BaseMetric;
  Logical_Path_Efficiency: BaseMetric;
  Planning_Efficiency: BaseMetric;
  Task_Sustainability_Score: BaseMetric;
  Cognitive_Flexibility_Score: BaseMetric;
  Error_Correction_Speed: BaseMetric;
  Cognitive_Load_Handling_Score: BaseMetric;
}

// Go/No-Go Game Metrics
export interface GoNoGoMetrics {
  Impulse_Control_Score: BaseMetric;
  Decision_Time: BaseMetric;
  Reaction_Time_Variability: BaseMetric;
  Decision_Making_Confidence: BaseMetric;
  Behavioral_Inhibition_Score: BaseMetric;
  Task_Switching_Efficiency: BaseMetric;
  Cognitive_Risk_Tolerance: BaseMetric;
  Frustration_Tolerance_Score: BaseMetric;
  Stress_Recovery_Speed: BaseMetric;
  Risk_Taking_Tendency: BaseMetric;
  Frustration_Recovery_Time: BaseMetric;
}

// Story Builder Metrics
export interface StoryBuilderMetrics {
  Language_Comprehension_Score: BaseMetric;
  Word_Complexity_Score: BaseMetric;
  Sentence_Coherence: BaseMetric;
  Verbal_Working_Memory_Score: BaseMetric;
  Sequential_Reasoning_Score: BaseMetric;
  Confidence_Score: BaseMetric;
  Resilience_Under_Pressure: BaseMetric;
  Social_Learning_Inclination: BaseMetric;
  Cognitive_Resilience_Score: BaseMetric;
}

// Maze Runner Metrics
export interface MazeRunnerMetrics {
  Pathfinding_Efficiency: BaseMetric;
  Navigation_Error_Rate: BaseMetric;
  Planning_Efficiency: BaseMetric;
  Time_Pressure_Handling_Score: BaseMetric;
  Information_Processing_Speed: BaseMetric;
  Cognitive_Working_Capacity: BaseMetric;
  Cognitive_Endurance_Score: BaseMetric;
  Dual_Task_Performance: BaseMetric;
}

// Combined game metrics type
export type GameSpecificMetrics =
  | MemoryMatchMetrics
  | StroopChallengeMetrics
  | PatternPuzzlerMetrics
  | SpatialNavigatorMetrics
  | TowerPlanningMetrics
  | GoNoGoMetrics
  | StoryBuilderMetrics
  | MazeRunnerMetrics;

// Helper function to create a new metric
export const createMetric = (value: number): BaseMetric => ({
  timestamp: Date.now(),
  value
}); 