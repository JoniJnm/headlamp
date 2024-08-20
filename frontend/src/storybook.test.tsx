import 'vitest-canvas-mock';
import { composeStories, type Meta, setProjectAnnotations, type StoryFn } from '@storybook/react';
import { act, render as testingLibraryRender } from '@testing-library/react';
import path from 'path';
import * as previewAnnotations from '../.storybook/preview';

const annotations = setProjectAnnotations([previewAnnotations, { testingLibraryRender }]);
beforeAll(annotations.beforeAll!);

type StoryFile = {
  default: Meta;
  [name: string]: StoryFn | Meta;
};

const compose = (entry: StoryFile) => {
  try {
    const stories = composeStories(entry);
    return stories;
  } catch (e) {
    throw new Error(
      `There was an issue composing stories for the module: ${JSON.stringify(entry)}, ${e}`
    );
  }
};

function getAllStoryFiles() {
  // Place the glob you want to match your story files
  const storyFiles = Object.entries(
    import.meta.glob<StoryFile>('./**/*.stories.tsx', {
      eager: true,
    })
  );

  return storyFiles.map(([filePath, storyFile]) => {
    const storyDir = path.dirname(filePath);
    const componentName = path.basename(filePath).replace(/\.(stories|story)\.[^/.]+$/, '');
    return { filePath, storyFile, componentName, storyDir };
  });
}

// Recreate similar options to Storyshots. Place your configuration below
const options = {
  storyKindRegex: /^.*?DontTest$/,
  snapshotsDirName: '__snapshots__',
  snapshotExtension: '.stories.storyshot',
};

vi.mock('@iconify/react', () => ({
  Icon: () => null,
  InlineIcon: () => null,
}));

vi.mock('@monaco-editor/react', () => ({
  loader: { config: () => null },
  default: () => <div className="mock-monaco-editor" />,
}));

/**
 * Recursively walks the tree and replaces any usage of useId
 */
function replaceUseId(node: any) {
  if (node.nodeType === Node.ELEMENT_NODE) {
    for (const attr of node.attributes) {
      if (attr.value.startsWith(':') && attr.value.endsWith(':')) {
        // Update the attribute value here
        node.setAttribute(attr.name, ':mock-test-id:');
      }
    }
  }

  // Recursively update child nodes
  for (const child of node.childNodes) {
    replaceUseId(child);
  }
}

describe('Storybook Tests', () => {
  getAllStoryFiles().forEach(({ storyFile, componentName, storyDir }) => {
    const meta = storyFile.default;
    const title = meta.title || componentName;

    if (options.storyKindRegex.test(title) || meta.parameters?.storyshots?.disable) {
      // Skip component tests if they are disabled
      return;
    }

    describe(title, async () => {
      const stories = Object.entries(compose(storyFile)).map(([name, story]) => ({
        name,
        story,
      }));

      if (stories.length <= 0) {
        throw new Error(
          `No stories found for this module: ${title}. Make sure there is at least one valid story for this module, without a disable parameter, or add parameters.storyshots.disable in the default export of this file.`
        );
      }

      stories.forEach(({ name, story }) => {
        test(name, async () => {
          await act(async () => {
            await story.run();
          });

          await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 60));
          });

          const snapshotPath = path.join(
            storyDir,
            options.snapshotsDirName,
            `${componentName}.${name}${options.snapshotExtension}`
          );

          replaceUseId(document);

          expect(document.body).toMatchFileSnapshot(snapshotPath);
        });
      });
    });
  });
});
