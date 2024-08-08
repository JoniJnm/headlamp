import { Meta, StoryFn } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { TestContext } from '../../test';
import Details from './Details';
import { PORT_INGRESS, RESOURCE_INGRESS } from './storyHelper';

export default {
  title: 'Ingress/DetailsView',
  component: Details,
  argTypes: {},
  decorators: [
    Story => {
      return (
        <TestContext routerMap={{ name: 'my-ingress' }}>
          <Story />
        </TestContext>
      );
    },
  ],
} as Meta;

const Template: StoryFn = () => {
  return <Details />;
};

export const WithTLS = Template.bind({});
WithTLS.args = {
  ingressJson: PORT_INGRESS,
};
WithTLS.parameters = {
  msw: {
    handlers: {
      story: [
        http.get('http://localhost:4466/apis/networking.k8s.io/v1/ingresses/my-ingress', () =>
          HttpResponse.json(PORT_INGRESS)
        ),
      ],
    },
  },
};

export const WithResource = Template.bind({});
WithResource.parameters = {
  msw: {
    handlers: {
      story: [
        http.get('http://localhost:4466/apis/networking.k8s.io/v1/ingresses/my-ingress', () =>
          HttpResponse.json(RESOURCE_INGRESS)
        ),
      ],
    },
  },
};
