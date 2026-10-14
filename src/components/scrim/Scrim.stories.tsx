import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../button';
import { Scrim } from './Scrim';

const meta: Meta<typeof Scrim> = {
  title: 'Components/Scrim',
  component: Scrim,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Full-viewport backdrop (Figma "Scrim", `Background/Scrim`) that marks the page behind a front component as temporarily unavailable. It fades in with the front component and fades out with it. `Modal` renders it for you — use `Scrim` directly only when building your own overlay (e.g. a custom drawer). When a click on the backdrop should close the front component, pass `onClick`: the whole scrim is the click target. Presentational only: no portal, focus management or scroll lock (the front component owns those). Decorative to assistive technology. Not for transient, non-blocking notices (use Snackbar).',
      },
    },
  },
  argTypes: {
    onClick: {
      description: 'Close the front component when the backdrop is clicked (optional)',
      table: { type: { summary: '(event) => void' } },
    },
    className: {
      control: 'text',
      description: 'Extra classes on the scrim (e.g. a different z-index)',
      table: { type: { summary: 'string' } },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** The scrim on its own, covering the viewport. */
export const Default: Story = {
  render: (args) => (
    <div style={{ minHeight: 320, padding: 24 }}>
      <p>Page content behind the scrim</p>
      <Scrim {...args} />
    </div>
  ),
};

/**
 * A custom drawer built from `Scrim`: the drawer opens with the scrim and a
 * click on the scrim closes both (Figma guideline: the whole scrim is the
 * click target). Left open at the end so axe scans the open state.
 */
export const CustomDrawer: Story = {
  render: () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <div style={{ minHeight: 360, padding: 24 }}>
          <Button onClick={() => setOpen(true)}>Open drawer</Button>
          {open && (
            <>
              <Scrim data-testid="scrim" onClick={() => setOpen(false)} />
              <div
                role="dialog"
                aria-label="Filters"
                className="fixed top-0 right-0 bottom-0 z-[51] w-80 p-sds-300 bg-sds-background-base"
              >
                <Button onClick={() => setOpen(false)}>Close</Button>
              </div>
            </>
          )}
        </div>
      );
    }
    return <Harness />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open drawer' }));
    const scrim = canvas.getByTestId('scrim');
    expect(scrim).toHaveAttribute('aria-hidden', 'true');
    await userEvent.click(scrim);
    await waitFor(() =>
      expect(canvas.queryByRole('dialog', { name: 'Filters' })).not.toBeInTheDocument(),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Open drawer' }));
    expect(canvas.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument();
  },
};
