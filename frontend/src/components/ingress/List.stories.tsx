import { Meta, StoryFn } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { TestContext } from '../../test';
import ListView from './List';
import { PORT_INGRESS, RESOURCE_INGRESS } from './storyHelper';

export default {
  title: 'Ingress/ListView',
  component: ListView,
  argTypes: {},
  decorators: [
    Story => {
      return (
        <TestContext>
          <Story />
        </TestContext>
      );
    },
  ],
  parameters: {
    msw: {
      handlers: {
        story: [
          http.get('http://localhost:4466/apis/networking.k8s.io/v1/ingresses', () =>
            HttpResponse.json({
              kind: 'IngressClassList',
              metadata: {},
              items: [PORT_INGRESS, RESOURCE_INGRESS],
            })
          ),
        ],
      },
    },
  },
} as Meta;

const Template: StoryFn = () => {
  return <ListView />;
};

export const Items = Template.bind({});
