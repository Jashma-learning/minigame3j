import { BaseMetric } from '../types/cognitiveMetrics';

export interface CognitiveMetricResult {
  value: number;
  weight: number;
}

interface MetricCalculator {
  [key: string]: (gameMetrics: Record<string, BaseMetric>) => CognitiveMetricResult;
}

// Cognitive domains and their associated game metrics
const cognitiveMetricCalculators: Record<string, MetricCalculator> = {
  memory: {
    'working_memory': (metrics) => ({
      value: metrics.Working_Memory_Span?.value || 0,
      weight: 1.0
    }),
    'short_term_memory': (metrics) => ({
      value: metrics.Short_Term_Memory_Retention?.value || 0,
      weight: 1.0
    }),
    'memory_recall': (metrics) => ({
      value: metrics.Memory_Recall_Accuracy?.value || 0,
      weight: 1.0
    })
  },
  attention: {
    'sustained_attention': (metrics) => ({
      value: metrics.Sustained_Attention_Duration?.value || 0,
      weight: 1.0
    }),
    'selective_attention': (metrics) => ({
      value: metrics.Selective_Attention_Score?.value || 0,
      weight: 1.0
    }),
    'divided_attention': (metrics) => ({
      value: metrics.Dual_Task_Performance?.value || 0,
      weight: 1.0
    })
  },
  processing: {
    'processing_speed': (metrics) => ({
      value: metrics.Information_Processing_Speed?.value || 0,
      weight: 1.0
    }),
    'reaction_time': (metrics) => ({
      value: metrics.Reaction_Time?.value || 0,
      weight: 1.0
    })
  },
  executive: {
    'planning': (metrics) => ({
      value: metrics.Planning_Efficiency?.value || 0,
      weight: 1.0
    }),
    'cognitive_flexibility': (metrics) => ({
      value: metrics.Cognitive_Flexibility_Score?.value || 0,
      weight: 1.0
    }),
    'inhibitory_control': (metrics) => ({
      value: metrics.Impulse_Control_Score?.value || 0,
      weight: 1.0
    })
  },
  spatial: {
    'spatial_awareness': (metrics) => ({
      value: metrics.Spatial_Rotation_Accuracy?.value || 0,
      weight: 1.0
    }),
    'navigation': (metrics) => ({
      value: metrics.Navigation_Error_Rate?.value || 0,
      weight: 1.0
    }),
    'spatial_memory': (metrics) => ({
      value: metrics.Spatial_Problem_Solving?.value || 0,
      weight: 1.0
    })
  }
};

export function calculateCognitiveMetrics(
  gameMetrics: Record<string, BaseMetric>
): Record<string, number> {
  const cognitiveScores: Record<string, number> = {};

  // Calculate scores for each cognitive domain
  Object.entries(cognitiveMetricCalculators).forEach(([domain, calculators]) => {
    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(calculators).forEach(([_, calculator]) => {
      const result = calculator(gameMetrics);
      totalScore += result.value * result.weight;
      totalWeight += result.weight;
    });

    cognitiveScores[domain] = totalWeight > 0 ? totalScore / totalWeight : 0;
  });

  return cognitiveScores;
} 