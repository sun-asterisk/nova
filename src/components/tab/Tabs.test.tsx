import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from 'storybook/test';
import { createRef, type ComponentProps } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

function ThreeTabs(props: Partial<ComponentProps<typeof Tabs>> = {}) {
  return (
    <Tabs defaultValue="a" {...props}>
      <TabsList>
        <TabsTrigger value="a" data-testid="tab-a">
          Tab A
        </TabsTrigger>
        <TabsTrigger value="b" data-testid="tab-b">
          Tab B
        </TabsTrigger>
        <TabsTrigger value="c" disabled data-testid="tab-c">
          Tab C
        </TabsTrigger>
      </TabsList>
      <TabsContent value="a">Content A</TabsContent>
      <TabsContent value="b">Content B</TabsContent>
      <TabsContent value="c">Content C</TabsContent>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('forwards refs through Tabs, TabsList, TabsTrigger, and TabsContent', () => {
    const rootRef = createRef<HTMLDivElement>();
    const listRef = createRef<HTMLDivElement>();
    const triggerRef = createRef<HTMLButtonElement>();
    const contentRef = createRef<HTMLDivElement>();

    render(
      <Tabs ref={rootRef} defaultValue="a" data-testid="root">
        <TabsList ref={listRef} data-testid="list">
          <TabsTrigger ref={triggerRef} value="a" data-testid="trigger">
            Tab A
          </TabsTrigger>
        </TabsList>
        <TabsContent ref={contentRef} value="a" data-testid="content">
          Content A
        </TabsContent>
      </Tabs>,
    );

    expect(rootRef.current).toBe(screen.getByTestId('root'));
    expect(listRef.current).toBe(screen.getByTestId('list'));
    expect(triggerRef.current).toBe(screen.getByTestId('trigger'));
    expect(contentRef.current).toBe(screen.getByTestId('content'));
  });

  it('shows the defaultValue tab active and its content visible (uncontrolled)', () => {
    render(<ThreeTabs />);
    expect(screen.getByTestId('tab-a')).toHaveAttribute('data-state', 'active');
    expect(screen.getByTestId('tab-b')).toHaveAttribute('data-state', 'inactive');
    expect(screen.getByText('Content A')).toBeInTheDocument();
    expect(screen.queryByText('Content B')).not.toBeInTheDocument();
  });

  it('clicking a trigger switches the active tab and its content', async () => {
    render(<ThreeTabs />);
    await userEvent.click(screen.getByTestId('tab-b'));

    expect(screen.getByTestId('tab-a')).toHaveAttribute('data-state', 'inactive');
    expect(screen.getByTestId('tab-b')).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('Content B')).toBeInTheDocument();
    expect(screen.queryByText('Content A')).not.toBeInTheDocument();
  });

  it('fires onValueChange with the newly selected value', async () => {
    const onValueChange = vi.fn();
    render(<ThreeTabs onValueChange={onValueChange} />);
    await userEvent.click(screen.getByTestId('tab-b'));
    expect(onValueChange).toHaveBeenCalledWith('b');
  });

  it('a disabled trigger cannot be activated by click', async () => {
    render(<ThreeTabs />);
    await userEvent.click(screen.getByTestId('tab-c'), { pointerEventsCheck: 0 });

    expect(screen.getByTestId('tab-c')).toHaveAttribute('data-state', 'inactive');
    expect(screen.getByTestId('tab-a')).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('Content A')).toBeInTheDocument();
  });

  it('respects a controlled value prop over its own internal state', async () => {
    const { rerender } = render(
      <Tabs value="a" onValueChange={() => {}}>
        <TabsList>
          <TabsTrigger value="a" data-testid="tab-a">
            Tab A
          </TabsTrigger>
          <TabsTrigger value="b" data-testid="tab-b">
            Tab B
          </TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content A</TabsContent>
        <TabsContent value="b">Content B</TabsContent>
      </Tabs>,
    );
    expect(screen.getByTestId('tab-a')).toHaveAttribute('data-state', 'active');

    // Clicking does NOT change anything on its own while controlled — only
    // a re-render with a new `value` prop should.
    await userEvent.click(screen.getByTestId('tab-b'));
    expect(screen.getByTestId('tab-a')).toHaveAttribute('data-state', 'active');

    rerender(
      <Tabs value="b" onValueChange={() => {}}>
        <TabsList>
          <TabsTrigger value="a" data-testid="tab-a">
            Tab A
          </TabsTrigger>
          <TabsTrigger value="b" data-testid="tab-b">
            Tab B
          </TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content A</TabsContent>
        <TabsContent value="b">Content B</TabsContent>
      </Tabs>,
    );
    expect(screen.getByTestId('tab-b')).toHaveAttribute('data-state', 'active');
  });

  it('merges a custom className on TabsList with the base layout classes', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList className="my-custom-class" data-testid="list">
          <TabsTrigger value="a">Tab A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content A</TabsContent>
      </Tabs>,
    );
    const list = screen.getByTestId('list');
    expect(list.className).toContain('my-custom-class');
    expect(list.className).toContain('flex');
  });
});
