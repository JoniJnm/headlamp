import { Meta, StoryFn } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { TestContext } from '../../test';
import VpaDetails from './Details';

const item = {
  apiVersion: 'autoscaling.k8s.io/v1',
  kind: 'VerticalPodAutoscaler',
  metadata: {
    annotations: {
      'kubectl.kubernetes.io/last-applied-configuration':
        '{"apiVersion":"autoscaling.k8s.io/v1","kind":"VerticalPodAutoscaler","metadata":{"annotations":{},"name":"multi-container-vpa","namespace":"default"},"spec":{"resourcePolicy":{"containerPolicies":[{"containerName":"web-container","controlledResources":["cpu","memory"],"controlledValues":"RequestsAndLimits","minAllowed":{"cpu":"80m","memory":"512Mi"}},{"containerName":"db-container","controlledResources":["cpu","memory"],"controlledValues":"RequestsAndLimits","minAllowed":{"cpu":"1000m","memory":"2Gi"}}]},"targetRef":{"apiVersion":"apps/v1","kind":"Deployment","name":"multi-container-deployment"},"updatePolicy":{"updateMode":"Auto"}}}\n',
    },
    creationTimestamp: '2023-11-23T07:18:45Z',
    name: 'multi-container-vpa',
    namespace: 'default',
    resourceVersion: '111487',
    uid: '79cf71ba-81f4-4e7b-957d-8625c3afb0c1',
  },
  spec: {
    resourcePolicy: {
      containerPolicies: [
        {
          containerName: 'web-container',
          controlledResources: ['cpu', 'memory'],
          controlledValues: 'RequestsAndLimits',
          minAllowed: {
            cpu: '80m',
            memory: '512Mi',
          },
        },
        {
          containerName: 'db-container',
          controlledResources: ['cpu', 'memory'],
          controlledValues: 'RequestsAndLimits',
          minAllowed: {
            cpu: '1000m',
            memory: '2Gi',
          },
        },
      ],
    },
    targetRef: {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      name: 'multi-container-deployment',
    },
    updatePolicy: {
      updateMode: 'Auto',
    },
  },
  status: {
    conditions: [
      {
        lastTransitionTime: '2023-11-23T07:18:48Z',
        status: 'True',
        type: 'RecommendationProvided',
      },
    ],
    recommendation: {
      containerRecommendations: [
        {
          containerName: 'db-container',
          lowerBound: {
            cpu: '1',
            memory: '2Gi',
          },
          target: {
            cpu: '1',
            memory: '2Gi',
          },
          uncappedTarget: {
            cpu: '12m',
            memory: '131072k',
          },
          upperBound: {
            cpu: '1',
            memory: '2Gi',
          },
        },
        {
          containerName: 'web-container',
          lowerBound: {
            cpu: '80m',
            memory: '512Mi',
          },
          target: {
            cpu: '80m',
            memory: '512Mi',
          },
          uncappedTarget: {
            cpu: '12m',
            memory: '131072k',
          },
          upperBound: {
            cpu: '80m',
            memory: '512Mi',
          },
        },
      ],
    },
  },
};

export default {
  title: 'VPA/VPADetailsView',
  component: VpaDetails,
  argTypes: {},
  decorators: [
    Story => {
      return (
        <TestContext routerMap={{ namespace: 'default', name: 'multi-container-vpa' }}>
          <Story />
        </TestContext>
      );
    },
  ],
} as Meta;

const Template: StoryFn = () => {
  return <VpaDetails />;
};

export const Default = Template.bind({});
Default.parameters = {
  msw: {
    handlers: {
      story: [
        http.get(
          'http://localhost:4466/apis/autoscaling.k8s.io/v1/namespaces/default/verticalpodautoscalers/multi-container-vpa',
          () => HttpResponse.json(item)
        ),
        http.get('http://localhost:4466/api/v1/namespaces/default/events', () =>
          HttpResponse.json({
            kind: 'EventList',
            items: [],
            metadata: {},
          })
        ),
      ],
    },
  },
};

export const Error = Template.bind({});
Error.parameters = {
  msw: {
    handlers: {
      story: [
        http.get(
          'http://localhost:4466/apis/autoscaling.k8s.io/v1/namespaces/default/verticalpodautoscalers/multi-container-vpa',
          () => HttpResponse.error()
        ),
        http.get('http://localhost:4466/api/v1/namespaces/default/events', () =>
          HttpResponse.json({
            kind: 'EventList',
            items: [],
            metadata: {},
          })
        ),
      ],
    },
  },
};
