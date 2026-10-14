import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
import { Badge } from '../badge';
import { IconBell, IconGear, IconHome, IconUser } from '../icons';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A Radix-based tabbed interface with roving-tabindex keyboard navigation (arrow keys move focus and selection between enabled tabs, skipping disabled ones, wrapping at both ends). Composed from `Tabs` (root, controlled or uncontrolled via `defaultValue`/`onValueChange`), `TabsList` (the tab strip), `TabsTrigger` (an individual tab, optionally `disabled`), and `TabsContent` (the panel shown for the matching `value`).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    defaultValue: {
      control: 'text',
      description: 'The value of the tab that should be active by default',
      table: {
        type: { summary: 'string' },
      },
    },
    onValueChange: {
      control: false,
      description: 'Callback fired when the active tab changes',
      table: {
        type: { summary: '(value: string) => void' },
      },
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply',
      table: {
        type: { summary: 'string' },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Tabs>;

/**
 * Basic tabs with simple text labels
 */
export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div style={{ padding: '16px' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: 600 }}>Tab 1 Content</h3>
          <p className="text-sds-text-secondary">This is the content for the first tab.</p>
        </div>
      </TabsContent>
      <TabsContent value="tab2">
        <div style={{ padding: '16px' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: 600 }}>Tab 2 Content</h3>
          <p className="text-sds-text-secondary">This is the content for the second tab.</p>
        </div>
      </TabsContent>
      <TabsContent value="tab3">
        <div style={{ padding: '16px' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: 600 }}>Tab 3 Content</h3>
          <p className="text-sds-text-secondary">This is the content for the third tab.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

/**
 * Tabs with badge indicators for notifications or counts
 */
export const WithBadges: Story = {
  render: () => (
    <Tabs defaultValue="inbox">
      <TabsList>
        <TabsTrigger value="inbox">
          Inbox
          <Badge label="12" />
        </TabsTrigger>
        <TabsTrigger value="archived">Archived</TabsTrigger>
        <TabsTrigger value="drafts">
          Drafts
          <Badge label="3" />
        </TabsTrigger>
        <TabsTrigger value="sent">Sent</TabsTrigger>
      </TabsList>
      <TabsContent value="inbox">
        <div style={{ padding: '16px' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: 600 }}>Inbox (12 unread)</h3>
          <p className="text-sds-text-secondary">You have 12 unread messages in your inbox.</p>
        </div>
      </TabsContent>
      <TabsContent value="archived">
        <div style={{ padding: '16px' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: 600 }}>Archived Messages</h3>
          <p className="text-sds-text-secondary">View your archived conversations here.</p>
        </div>
      </TabsContent>
      <TabsContent value="drafts">
        <div style={{ padding: '16px' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: 600 }}>Draft Messages (3)</h3>
          <p className="text-sds-text-secondary">You have 3 draft messages waiting to be sent.</p>
        </div>
      </TabsContent>
      <TabsContent value="sent">
        <div style={{ padding: '16px' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: 600 }}>Sent Messages</h3>
          <p className="text-sds-text-secondary">View all messages you have sent.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

/**
 * Tabs with icon indicators for better visual recognition
 */
export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="home">
      <TabsList>
        <TabsTrigger value="home">
          <IconHome />
          Home
        </TabsTrigger>
        <TabsTrigger value="profile">
          <IconUser />
          Profile
        </TabsTrigger>
        <TabsTrigger value="settings">
          <IconGear />
          Settings
        </TabsTrigger>
        <TabsTrigger value="notifications">
          <IconBell />
          Notifications
          <Badge label="5" />
        </TabsTrigger>
      </TabsList>
      <TabsContent value="home">
        <div style={{ padding: '16px' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: 600 }}>Home Dashboard</h3>
          <p className="text-sds-text-secondary">Welcome to your home dashboard.</p>
        </div>
      </TabsContent>
      <TabsContent value="profile">
        <div style={{ padding: '16px' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: 600 }}>User Profile</h3>
          <p className="text-sds-text-secondary">Manage your profile information here.</p>
        </div>
      </TabsContent>
      <TabsContent value="settings">
        <div style={{ padding: '16px' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: 600 }}>Settings</h3>
          <p className="text-sds-text-secondary">Configure your application settings.</p>
        </div>
      </TabsContent>
      <TabsContent value="notifications">
        <div style={{ padding: '16px' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: 600 }}>Notifications (5 new)</h3>
          <p className="text-sds-text-secondary">You have 5 new notifications to review.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

/**
 * Tabs with disabled state to prevent user interaction
 */
export const WithDisabled: Story = {
  render: () => (
    <Tabs defaultValue="available">
      <TabsList>
        <TabsTrigger value="available">Available</TabsTrigger>
        <TabsTrigger value="coming-soon" disabled>
          Coming Soon
        </TabsTrigger>
        <TabsTrigger value="locked" disabled>
          Locked
        </TabsTrigger>
        <TabsTrigger value="beta">Beta</TabsTrigger>
      </TabsList>
      <TabsContent value="available">
        <div style={{ padding: '16px' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: 600 }}>Available Features</h3>
          <p className="text-sds-text-secondary">These features are currently available for use.</p>
        </div>
      </TabsContent>
      <TabsContent value="beta">
        <div style={{ padding: '16px' }}>
          <h3 style={{ marginBottom: '8px', fontWeight: 600 }}>Beta Features</h3>
          <p className="text-sds-text-secondary">Try out our experimental features in beta.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

/**
 * Tabs with an `onValueChange` callback, surfaced on-page via a visible log
 * rather than a blocking `alert()` — a Storybook story must never block the
 * UI thread (§18), and a log is also what a real `play()` could assert on.
 */
export const WithCallback: Story = {
  render: () => {
    function Demo() {
      const [log, setLog] = useState<string[]>([]);

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Tabs
            defaultValue="tab1"
            onValueChange={(value) => setLog((prev) => [...prev, `Switched to: ${value}`])}
          >
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              <TabsTrigger value="tab3">Tab 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">
              <div style={{ padding: '16px' }}>
                <p className="text-sds-text-secondary">
                  Click on other tabs to trigger the onChange callback (see the log below).
                </p>
              </div>
            </TabsContent>
            <TabsContent value="tab2">
              <div style={{ padding: '16px' }}>
                <p className="text-sds-text-secondary">Tab 2 is now active!</p>
              </div>
            </TabsContent>
            <TabsContent value="tab3">
              <div style={{ padding: '16px' }}>
                <p className="text-sds-text-secondary">Tab 3 is now active!</p>
              </div>
            </TabsContent>
          </Tabs>
          <ul
            data-testid="callback-log"
            className="text-sds-text-secondary"
            style={{ fontSize: '13px' }}
          >
            {log.map((entry, i) => (
              <li key={i}>{entry}</li>
            ))}
          </ul>
        </div>
      );
    }

    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Tab 2' }));
    expect(canvas.getByTestId('callback-log')).toHaveTextContent('Switched to: tab2');
  },
};

/**
 * All tab variants and features combined for comprehensive demonstration
 */
export const AllFeatures: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '600px' }}>
      <div>
        <h4 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>Basic Tabs</h4>
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p className="text-sds-text-secondary">Basic tab content</p>
          </TabsContent>
          <TabsContent value="tab2">
            <p className="text-sds-text-secondary">Tab 2 content</p>
          </TabsContent>
          <TabsContent value="tab3">
            <p className="text-sds-text-secondary">Tab 3 content</p>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <h4 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>
          Tabs with Badges
        </h4>
        <Tabs defaultValue="messages">
          <TabsList>
            <TabsTrigger value="messages">
              Messages
              <Badge label="99+" />
            </TabsTrigger>
            <TabsTrigger value="alerts">
              Alerts
              <Badge label="5" />
            </TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
          </TabsList>
          <TabsContent value="messages">
            <p className="text-sds-text-secondary">99+ unread messages</p>
          </TabsContent>
          <TabsContent value="alerts">
            <p className="text-sds-text-secondary">5 new alerts</p>
          </TabsContent>
          <TabsContent value="updates">
            <p className="text-sds-text-secondary">No new updates</p>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <h4 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>
          Tabs with Icons and Badges
        </h4>
        <Tabs defaultValue="dashboard">
          <TabsList>
            <TabsTrigger value="dashboard">
              <span>📊</span>
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <span>✓</span>
              Tasks
              <Badge label="12" />
            </TabsTrigger>
            <TabsTrigger value="settings">
              <span>⚙️</span>
              Settings
            </TabsTrigger>
            <TabsTrigger value="locked" disabled>
              <span>🔒</span>
              Locked
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <p className="text-sds-text-secondary">Dashboard overview</p>
          </TabsContent>
          <TabsContent value="tasks">
            <p className="text-sds-text-secondary">12 pending tasks</p>
          </TabsContent>
          <TabsContent value="settings">
            <p className="text-sds-text-secondary">Settings panel</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  ),
};

/**
 * Playground for testing different tab configurations
 */
export const Playground: Story = {
  args: {
    defaultValue: 'tab1',
  },
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">
          <Badge label="5" />
          Tab 2
        </TabsTrigger>
        <TabsTrigger value="tab3">
          <span>⭐</span>
          Tab 3
        </TabsTrigger>
        <TabsTrigger value="tab4" disabled>
          Disabled
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div style={{ padding: '16px' }}>
          <p className="text-sds-text-secondary">Customize the tabs using Storybook controls</p>
        </div>
      </TabsContent>
      <TabsContent value="tab2">
        <div style={{ padding: '16px' }}>
          <p className="text-sds-text-secondary">Tab with badge indicator</p>
        </div>
      </TabsContent>
      <TabsContent value="tab3">
        <div style={{ padding: '16px' }}>
          <p className="text-sds-text-secondary">Tab with icon</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

/**
 * Real keyboard-interaction regression coverage. This component previously
 * had ZERO automated interaction assertions (no `play()` in this file, no
 * unit test) despite Tabs being a primitive whose entire accessibility
 * value proposition is roving-tabindex + arrow-key navigation — found
 * during Phase 10 certification. `fireEvent.keyDown` (React Testing
 * Library, synthetic DOM events) does NOT trigger Radix's internal
 * RovingFocusGroup arrow-key handling reliably; `userEvent` here dispatches
 * real, trusted browser key events via Playwright, which is what Radix's
 * listeners actually respond to — matching the same proven pattern already
 * used for `RadioGroup`'s `InteractionSelectAndArrowNav` story.
 */
export const InteractionArrowNavAndDisabledSkip: Story = {
  render: () => (
    <Tabs defaultValue="a">
      <TabsList>
        <TabsTrigger value="a">A</TabsTrigger>
        <TabsTrigger value="b" disabled>
          B
        </TabsTrigger>
        <TabsTrigger value="c">C</TabsTrigger>
      </TabsList>
      <TabsContent value="a">Content A</TabsContent>
      <TabsContent value="c">Content C</TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabA = canvas.getByRole('tab', { name: 'A' });
    const tabB = canvas.getByRole('tab', { name: 'B' });
    const tabC = canvas.getByRole('tab', { name: 'C' });

    expect(tabA).toHaveAttribute('aria-selected', 'true');
    expect(tabB).toBeDisabled();

    tabA.focus();
    expect(tabA).toHaveFocus();

    // B is disabled — ArrowRight must skip straight to C, not land on B.
    await userEvent.keyboard('{ArrowRight}');
    expect(tabC).toHaveFocus();
    expect(tabC).toHaveAttribute('aria-selected', 'true');
    expect(tabA).toHaveAttribute('aria-selected', 'false');

    // Wrap-around: ArrowRight from the last enabled tab returns to the first.
    await userEvent.keyboard('{ArrowRight}');
    expect(tabA).toHaveFocus();
    expect(tabA).toHaveAttribute('aria-selected', 'true');

    // A disabled tab cannot be clicked into selection either.
    await userEvent.click(tabB, { pointerEventsCheck: 0 });
    expect(tabB).toHaveAttribute('aria-selected', 'false');
    expect(tabA).toHaveAttribute('aria-selected', 'true');
  },
};

const MANY_TABS = [
  'すべて',
  '未読',
  'お届け予定日が変更された注文',
  'キャンセル',
  '返品',
  'お気に入り',
  '履歴',
  '設定',
];

/**
 * Many tabs in a narrow container (Figma Tab guideline): every tab keeps its
 * own size and a one-line label, and the list scrolls horizontally instead of
 * squeezing the tabs. Selecting a tab that is cut off scrolls it fully into
 * view; an edge tab keeps the list's 16px margin. Left scrolled to the last tab.
 */
export const ManyTabsScrollable: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Tabs defaultValue="t0">
        <TabsList data-testid="list">
          {MANY_TABS.map((label, i) => (
            <TabsTrigger key={label} value={`t${i}`}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {MANY_TABS.map((label, i) => (
          <TabsContent key={label} value={`t${i}`}>
            {label}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByTestId('list');
    expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
    for (const tab of canvas.getAllByRole('tab')) {
      expect(tab.getBoundingClientRect().height).toBe(40);
    }
    canvas.getByRole('tab', { name: 'すべて' }).focus();
    await userEvent.keyboard('{End}');
    const last = canvas.getByRole('tab', { name: '設定' });
    expect(last).toHaveAttribute('aria-selected', 'true');
    await waitFor(() =>
      expect(
        Math.round(list.getBoundingClientRect().right - last.getBoundingClientRect().right),
      ).toBe(16),
    );
  },
};
