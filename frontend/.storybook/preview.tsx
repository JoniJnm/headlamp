import themesConf from '../src/lib/themes';
import { ThemeProvider } from '@mui/material/styles';
import { initialize, mswLoader } from 'msw-storybook-addon';
import '../src/index.css';
import { Title, Subtitle, Description, Primary, Controls } from '@storybook/blocks';
import { baseMocks } from './baseMocks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// https://github.com/mswjs/msw-storybook-addon
initialize();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: 'always',
      staleTime: 0,
      retry: false,
      gcTime: 0,
    },
  },
});

const withThemeProvider = (Story: any, context: any) => {
  const theme = themesConf[context.globals.backgrounds?.value === '#1f1f1f' ? 'dark' : 'light'];

  const ourThemeProvider = (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <Story {...context} />
      </ThemeProvider>
    </QueryClientProvider>
  );
  return ourThemeProvider;
};
export const decorators = [withThemeProvider];

export const parameters = {
  backgrounds: {
    values: [
      { name: 'light', value: '#FFF' },
      { name: 'dark', value: '#1f1f1f' },
    ],
  },

  docs: {
    toc: { disable: true },
    // Customize docs page to exclude display of all stories
    // Becasue it would cause stories override each others' mocks
    page: () => (
      <>
        <Title />
        <Subtitle />
        <Description />
        <Primary />
        <Controls />
      </>
    ),
  },

  // https://github.com/mswjs/msw-storybook-addon#composing-request-handlers
  msw: {
    handlers: {
      /**
       * If you wan't to override or disable them in a particular story
       * set base to null in msw configuration
       *
       * parameters: {
       *   msw: {
       *     handlers: {
       *       base: null,
       *       story: [yourMocks]
       *     }
       *   }
       * }
       */
      base: baseMocks,
    },
  },
};

export const loaders = [mswLoader];

export const tags = ['autodocs', 'autodocs'];
