import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { MdPerson, MdMail, MdWarning, MdInfo, MdError, MdCheckCircle } from 'react-icons/md';
import { Button } from '../button';
import { TextField } from '../textField';
import { tokenColor } from '../../../.storybook/tokenColor';
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from './Modal';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "A compound dialog built on Radix Dialog — Trigger, Content (with `size`/`container` portal redirect), Header/Body/Footer with scroll-aware dividers, Title, Description, and Close. Focus is trapped inside while open and restored to the trigger on close; `Escape` closes it. `ModalContent`'s `container` prop redirects the portal (e.g. into a scoped ThemeProvider region).",
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      description: 'Modal open/close state (controlled mode)',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
      },
    },
    onOpenChange: {
      description: 'Callback when open state changes',
      table: {
        type: { summary: '(open: boolean) => void' },
      },
    },
    defaultOpen: {
      description: 'Initial open state (uncontrolled mode)',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Basic modal (Medium size)
 */
export const Default: Story = {
  render: () => {
    return (
      <Modal>
        <ModalTrigger asChild>
          <Button variant="primary">Open Modal</Button>
        </ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Modal Title</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="min-h-[200px] bg-sds-surface-secondary rounded-sds-100 flex items-center justify-center">
              <span className="text-sds-text-secondary">Content Slot</span>
            </div>
          </ModalBody>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="secondary">Cancel</Button>
            </ModalClose>
            <Button variant="primary">Confirm</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic modal example. Medium size (500px) is the default.',
      },
    },
  },
};

/**
 * Small size modal (384px)
 */
export const Small: Story = {
  render: () => {
    return (
      <Modal>
        <ModalTrigger asChild>
          <Button variant="primary">Small Modal</Button>
        </ModalTrigger>
        <ModalContent size="small">
          <ModalHeader>
            <ModalTitle>Modal Title</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="min-h-[150px] bg-sds-surface-secondary rounded-sds-100 flex items-center justify-center">
              <span className="text-sds-text-secondary">Content Slot</span>
            </div>
          </ModalBody>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="secondary" size="small">
                Cancel
              </Button>
            </ModalClose>
            <Button variant="primary" size="small">
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Small size (384px) modal. Suitable for compact confirmation dialogs.',
      },
    },
  },
};

/**
 * Large size modal (768px)
 */
export const Large: Story = {
  render: () => {
    return (
      <Modal>
        <ModalTrigger asChild>
          <Button variant="primary">Large Modal</Button>
        </ModalTrigger>
        <ModalContent size="large">
          <ModalHeader>
            <ModalTitle>Modal Title</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="min-h-[300px] bg-sds-surface-secondary rounded-sds-100 flex items-center justify-center">
              <span className="text-sds-text-secondary">Content Slot</span>
            </div>
          </ModalBody>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="secondary">Cancel</Button>
            </ModalClose>
            <Button variant="primary">Confirm</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Large size (768px) modal. Suitable for complex forms and detailed information display.',
      },
    },
  },
};

/**
 * Modal with form fields
 */
export const WithFormFields: Story = {
  render: () => {
    return (
      <Modal>
        <ModalTrigger asChild>
          <Button variant="primary">Add Member</Button>
        </ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Add New Member</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <TextField label="Name" placeholder="John Doe" required startAdornment={<MdPerson />} />
            <TextField
              label="Email Address"
              type="email"
              placeholder="example@email.com"
              required
              startAdornment={<MdMail />}
            />
          </ModalBody>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="secondary">Cancel</Button>
            </ModalClose>
            <Button variant="primary">Add Member</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal with form input fields. Used for collecting user information.',
      },
    },
  },
};

/**
 * Long content requiring scroll
 */
export const LongContent: Story = {
  render: () => {
    return (
      <Modal>
        <ModalTrigger asChild>
          <Button variant="primary">View Terms of Service</Button>
        </ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Terms of Service</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4 text-sds-text-secondary text-sm">
              <section>
                <h3 className="font-bold text-sds-text-primary mb-2">
                  Chapter 1: General Provisions
                </h3>
                <p>
                  These Terms of Service (&quot;Terms&quot;) govern your use of the services
                  provided on this website (&quot;Service&quot;). By accessing or using the Service,
                  you agree to be bound by these Terms.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-sds-text-primary mb-1">
                  ■ Definition of Members
                </h4>
                <p>
                  A &quot;Member&quot; refers to an individual or entity who has registered an ID
                  and password through the dedicated member registration screen and has obtained
                  membership status to purchase our products or services.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-sds-text-primary mb-1">
                  ■ Definition of General Customers
                </h4>
                <p>
                  &quot;General Customers&quot; refers to users who have not registered as members.
                  While general customers can browse the website and product information in
                  &quot;viewing mode,&quot; membership registration is required to purchase our
                  products.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-sds-text-primary mb-1">■ Member Registration</h4>
                <p className="mb-2">
                  Prospective members must apply for membership by entering required information on
                  the designated member registration screen.
                </p>
                <p>
                  A membership agreement (&quot;Membership Agreement&quot;) is established between
                  the Company and the applicant when the Company accepts the registration
                  application.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-sds-text-primary mb-1">
                  ■ Product Pricing and Payment Terms
                </h4>
                <p className="mb-2">
                  Product prices are those listed on the product introduction pages within the
                  website (including consumption tax).
                </p>
                <p>
                  Some products on this website can be purchased directly from the top page or
                  product search page, while others require a formal quotation before purchase.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-sds-text-primary mb-1">
                  ■ Handling of Personal Information
                </h4>
                <p>
                  The Company will handle members&apos; personal information appropriately in
                  accordance with the Company&apos;s Privacy Policy.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-sds-text-primary mb-1">
                  ■ Prohibited Activities
                </h4>
                <p className="mb-2">Members shall not engage in any of the following activities:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Acts that violate laws, regulations, or public order and morals</li>
                  <li>Acts related to criminal activities</li>
                  <li>Unauthorized access to the Service or interference with its operation</li>
                  <li>Infringement of intellectual property rights, including copyrights</li>
                  <li>Transmission of harmful computer programs such as viruses</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-sds-text-primary mb-1">
                  ■ Service Modifications and Termination
                </h4>
                <p>
                  The Company may modify, suspend, or terminate all or part of the Service without
                  prior notice to Members. The Company shall not be liable for any damages arising
                  from such modifications, suspensions, or terminations.
                </p>
              </section>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary">I Agree</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'When content is long, the ModalBody automatically becomes scrollable. A scrollbar appears once content exceeds the max-height (viewport height minus an 80px margin reserved on both the top and bottom — not 80% of viewport height).',
      },
    },
  },
  // Regression coverage for the 2026-09-07 Figma-fidelity audit: Figma's
  // own guideline requires a divider line that dynamically appears below
  // the header while content is hidden above, and above the footer while
  // content is hidden below — never both hidden, both, or just one,
  // depending on scroll position. Verifies all 3 states with a real
  // (non-simulated) scroll on the actual portal-rendered dialog.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'View Terms of Service' });

    await userEvent.click(trigger);

    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog');
    await waitFor(() => expect(dialog).toBeVisible());
    // Resolved once, outside every waitFor(): tokenColor() appends/removes a
    // probe element, and waitFor() re-runs its callback on every DOM
    // mutation — calling it inside waitFor() loops forever (hung the story).
    const weakBorder = tokenColor(dialog, '--color-sds-border-weak');

    const header = dialog.querySelector('[data-slot="modal-header"]') as HTMLElement;
    // The scrolling element is the Sun Scrollbar viewport inside the body.
    const modalBody = dialog.querySelector(
      '[data-slot="modal-body"] [data-slot="scroll-area-viewport"]',
    ) as HTMLElement;
    const footer = dialog.querySelector('[data-slot="modal-footer"]') as HTMLElement;

    // At the top: content is hidden below only — header divider hidden,
    // footer divider shown.
    await waitFor(() => {
      expect(getComputedStyle(header).borderBottomColor).toBe('rgba(0, 0, 0, 0)');
      expect(getComputedStyle(footer).borderTopColor).toBe(weakBorder);
    });

    // Scroll to the middle: content hidden both above and below — both
    // dividers shown.
    // Middle of the scrollable range (not scrollHeight / 2, which reaches the
    // bottom whenever the overflow is less than half the content — e.g. at the
    // wider Medium default size).
    modalBody.scrollTop = (modalBody.scrollHeight - modalBody.clientHeight) / 2;
    await waitFor(() => {
      expect(getComputedStyle(header).borderBottomColor).toBe(weakBorder);
      expect(getComputedStyle(footer).borderTopColor).toBe(weakBorder);
    });

    // Scroll to the bottom: content hidden above only — header divider
    // shown, footer divider hidden.
    modalBody.scrollTop = modalBody.scrollHeight;
    await waitFor(() => {
      expect(getComputedStyle(header).borderBottomColor).toBe(weakBorder);
      expect(getComputedStyle(footer).borderTopColor).toBe('rgba(0, 0, 0, 0)');
    });

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(dialog).not.toBeVisible());
  },
};

/**
 * Edge-case regression coverage for the scroll-divider feature: content
 * starts short (fits entirely, no dividers), then a button dynamically adds
 * more paragraphs until it overflows — the footer divider must appear
 * without the user ever having scrolled, since `ModalBody`'s effect
 * re-measures on every `children` change, not only on `scroll`/resize
 * events. (Window-resize-driven re-measurement is covered by the same
 * `ResizeObserver` and isn't separately tested here — it's the same,
 * already-standard browser mechanism, not custom logic.)
 */
export const ScrollDividerUpdatesOnContentChange: Story = {
  render: () => {
    function Harness() {
      const [count, setCount] = useState(2);
      return (
        <Modal defaultOpen>
          <ModalTrigger asChild>
            <Button variant="primary">Open</Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Growing Content</ModalTitle>
            </ModalHeader>
            <ModalBody>
              {Array.from({ length: count }, (_, i) => (
                <p key={i}>Paragraph {i + 1}</p>
              ))}
              <Button data-testid="add-content" onClick={() => setCount((c) => c + 20)}>
                Add more content
              </Button>
            </ModalBody>
            <ModalFooter>
              <Button variant="primary">Confirm</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      );
    }
    return <Harness />;
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog');
    await waitFor(() => expect(dialog).toBeVisible());
    // Resolved once, outside every waitFor(): tokenColor() appends/removes a
    // probe element, and waitFor() re-runs its callback on every DOM
    // mutation — calling it inside waitFor() loops forever (hung the story).
    const weakBorder = tokenColor(dialog, '--color-sds-border-weak');

    const header = dialog.querySelector('[data-slot="modal-header"]') as HTMLElement;
    const footer = dialog.querySelector('[data-slot="modal-footer"]') as HTMLElement;

    // Starts with only 2 short paragraphs — content fits, no dividers.
    await waitFor(() => {
      expect(getComputedStyle(header).borderBottomColor).toBe('rgba(0, 0, 0, 0)');
      expect(getComputedStyle(footer).borderTopColor).toBe('rgba(0, 0, 0, 0)');
    });

    // Add enough content to overflow — the footer divider must appear
    // WITHOUT the user ever scrolling, proving the `children`-change effect
    // (not just `scroll`/`ResizeObserver`) drives re-measurement.
    const addButton = within(dialog).getByTestId('add-content');
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(getComputedStyle(footer).borderTopColor).toBe(weakBorder);
    });
  },
};

/**
 * Danger confirmation modal (destructive action)
 */
export const DangerConfirmation: Story = {
  render: () => {
    return (
      <Modal>
        <ModalTrigger asChild>
          <Button variant="danger">Delete Data</Button>
        </ModalTrigger>
        {/* Figma's own guideline explicitly recommends disabling the close
            button AND scrim-click/Escape for exactly this case (a critical,
            "force a clear decision" confirmation) — this reference story
            previously didn't follow it, despite the capability already
            existing via Radix's own `onPointerDownOutside`/`onEscapeKeyDown`
            (inherited props, no new Modal API needed). */}
        <ModalContent
          size="small"
          onPointerDownOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
        >
          <ModalHeader showCloseButton={false}>
            <div className="flex items-center gap-3">
              <MdWarning className="w-6 h-6 text-sds-icon-warning shrink-0 mt-0.5" />
              <div className="flex-1">
                <ModalTitle>Are you sure you want to delete?</ModalTitle>
              </div>
            </div>
          </ModalHeader>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="secondary">Cancel</Button>
            </ModalClose>
            <Button variant="danger">Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Modal for confirming destructive actions like deletion. Warning icon and danger button emphasize the caution. No close button and no dismiss-on-outside-click/Escape — per Figma's own guideline, a critical confirmation should force an explicit decision via the footer buttons.",
      },
    },
  },
};

/**
 * Modal without close button
 */
export const WithoutCloseButton: Story = {
  render: () => {
    return (
      <Modal>
        <ModalTrigger asChild>
          <Button variant="primary">Confirmation Dialog</Button>
        </ModalTrigger>
        <ModalContent size="small">
          <ModalHeader showCloseButton={false}>
            <ModalTitle>Do you want to proceed?</ModalTitle>
          </ModalHeader>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="secondary">No</Button>
            </ModalClose>
            <Button variant="emphasis">Yes</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Modal with the close button (X) hidden. Use when requiring users to make an explicit choice via action buttons.',
      },
    },
  },
};

/**
 * Modal with description
 */
export const WithForm: Story = {
  render: () => {
    return (
      <Modal>
        <ModalTrigger asChild>
          <Button variant="primary">View Details</Button>
        </ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Account Settings</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p className="text-sds-text-secondary text-sm mb-4">
              Make changes to your account settings. Click save when you&apos;re done.
            </p>
            <div className="space-y-4">
              <TextField label="Username" placeholder="Enter username" defaultValue="johndoe" />
              <TextField
                label="Email"
                type="email"
                placeholder="Enter email"
                defaultValue="john@example.com"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="secondary">Cancel</Button>
            </ModalClose>
            <Button variant="primary">Save Changes</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal with basic form.',
      },
    },
  },
};

/**
 * Three-button footer (Figma's own guideline: at most 3 action buttons — a
 * 3rd choice like "Save Draft" is placed on the far left, separate from the
 * grouped Cancel/Confirm pair on the right). Achieved via plain composition
 * (a `justify-between` `className` override on `ModalFooter`, which merges
 * correctly with the default `justify-end` via `cn()`/`tailwind-merge`) —
 * deliberately NOT a new `actions`-array prop, since `ModalFooter` is fully
 * compositional by design and this pattern needs no new API surface.
 */
export const ThreeButtonFooter: Story = {
  render: () => {
    return (
      <Modal>
        <ModalTrigger asChild>
          <Button variant="primary">Edit Post</Button>
        </ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Edit Post</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <TextField label="Title" placeholder="Post title" defaultValue="My draft post" />
          </ModalBody>
          <ModalFooter className="justify-between">
            <Button variant="plain">Save Draft</Button>
            <div className="flex items-center gap-sds-150">
              <ModalClose asChild>
                <Button variant="secondary">Cancel</Button>
              </ModalClose>
              <Button variant="primary">Publish</Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'A 3rd action button ("Save Draft") on the far left, separate from the Cancel/Confirm pair on the right — the maximum Figma allows (2 is the norm; a 3rd choice is only for cases like this).',
      },
    },
  },
};

/**
 * Controlled modal with state
 */
export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex gap-2">
        <Modal open={open} onOpenChange={setOpen}>
          <ModalTrigger asChild>
            <Button variant="primary">Open Controlled Modal</Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Controlled Modal</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p className="text-sds-text-secondary mb-2">
                This modal&apos;s state is controlled externally.
              </p>
              <p className="text-sds-text-secondary">
                The open state is controlled by React state. You can open/close it from outside the
                modal.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={() => setOpen(false)}>
                Done
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Open from Outside
        </Button>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Controlled modal where the open state is managed externally. Useful for programmatic control.',
      },
    },
  },
};

/**
 * Info modal with icon
 */
export const InfoModal: Story = {
  render: () => {
    return (
      <Modal>
        <ModalTrigger asChild>
          <Button variant="primary">Show Info</Button>
        </ModalTrigger>
        <ModalContent size="small">
          <ModalHeader>
            <div className="flex items-start gap-3">
              <MdInfo className="w-6 h-6 text-sds-icon-info shrink-0 mt-0.5" />
              <div className="flex-1">
                <ModalTitle>Information</ModalTitle>
                <p className="text-sds-text-secondary text-sm mt-1">
                  Your changes have been saved successfully.
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="primary">Got it</Button>
            </ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Info modal with icon. Uses slot pattern for custom icon placement.',
      },
    },
  },
};

/**
 * Success modal with icon
 */
export const SuccessModal: Story = {
  render: () => {
    return (
      <Modal>
        <ModalTrigger asChild>
          <Button variant="primary">Show Success</Button>
        </ModalTrigger>
        <ModalContent size="small">
          <ModalHeader>
            <div className="flex items-start gap-3">
              <MdCheckCircle className="w-6 h-6 text-sds-icon-success shrink-0 mt-0.5" />
              <div className="flex-1">
                <ModalTitle>Success</ModalTitle>
                <p className="text-sds-text-secondary text-sm mt-1">
                  Your operation completed successfully.
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="primary">Continue</Button>
            </ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Success modal with check icon to indicate successful operation.',
      },
    },
  },
};

/**
 * Error modal with icon
 */
export const ErrorModal: Story = {
  render: () => {
    return (
      <Modal>
        <ModalTrigger asChild>
          <Button variant="danger">Show Error</Button>
        </ModalTrigger>
        <ModalContent size="small">
          <ModalHeader>
            <div className="flex items-start gap-3">
              <MdError className="w-6 h-6 text-sds-icon-danger shrink-0 mt-0.5" />
              <div className="flex-1">
                <ModalTitle>Error</ModalTitle>
                <p className="text-sds-text-secondary text-sm mt-1">
                  An error occurred while processing your request. Please try again.
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="secondary">Cancel</Button>
            </ModalClose>
            <Button variant="danger">Retry</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Error modal with error icon. Used to display error messages.',
      },
    },
  },
};

export const InteractionOpenEscapeClose: Story = {
  render: () => (
    <Modal>
      <ModalTrigger asChild>
        <Button variant="primary">Open Modal</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Modal Title</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="min-h-[100px] bg-sds-surface-secondary rounded-sds-100 flex items-center justify-center">
            <span className="text-sds-text-secondary">Content Slot</span>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open Modal' });

    await userEvent.click(trigger);

    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog');
    await waitFor(() => expect(dialog).toBeVisible());
    expect(within(dialog).getByText('Modal Title')).toBeVisible();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(dialog).not.toBeVisible());
    await waitFor(() => expect(trigger).toHaveFocus());

    // Radix un-hides background content asynchronously as the dialog
    // closes — wait for that cleanup so the a11y scan doesn't catch a
    // transient moment where the (now-focused) trigger is still inside an
    // aria-hidden ancestor.
    await waitFor(() => expect(trigger.closest('[aria-hidden="true"]')).toBeNull());
  },
};

export const InteractionFocusTrap: Story = {
  render: () => (
    <Modal>
      <ModalTrigger asChild>
        <Button variant="primary">Open Modal</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Modal Title</ModalTitle>
        </ModalHeader>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="secondary">Cancel</Button>
          </ModalClose>
          <Button variant="primary">Confirm</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open Modal' });
    await userEvent.click(trigger);

    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog');
    await waitFor(() => expect(dialog).toBeVisible());

    const closeXButton = body.getByRole('button', { name: 'Close dialog' });
    const cancelButton = body.getByRole('button', { name: 'Cancel' });
    const confirmButton = body.getByRole('button', { name: 'Confirm' });

    // Tab all the way around the dialog's focusable set (X, Cancel, Confirm)
    // several times over and confirm focus never escapes to the trigger or
    // document.body — i.e. the focus trap actually holds.
    for (let i = 0; i < 8; i++) {
      await userEvent.tab();
      const active = canvasElement.ownerDocument.activeElement;
      expect([closeXButton, cancelButton, confirmButton]).toContain(active);
      expect(active).not.toBe(trigger);
    }

    // Shift+Tab (reverse direction) must also stay trapped.
    await userEvent.tab({ shift: true });
    const activeAfterShiftTab = canvasElement.ownerDocument.activeElement;
    expect([closeXButton, cancelButton, confirmButton]).toContain(activeAfterShiftTab);
  },
};

/**
 * Figma "+ Status Icon": a status icon before the title, with the body and
 * footer aligned to the title. Use it for confirmations whose severity the
 * icon reinforces (the title still has to say what happens). Left open.
 */
export const WithStatusIcon: Story = {
  render: () => (
    <Modal defaultOpen>
      <ModalTrigger asChild>
        <Button variant="danger">Delete</Button>
      </ModalTrigger>
      <ModalContent status="danger">
        <ModalHeader showCloseButton={false}>
          <ModalTitle>注文を取り消しますか？</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p>
            現在の注文は無効となり、払い戻しの処理が開始されます。この操作は元に戻すことはできません。
          </p>
        </ModalBody>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="secondary">キャンセル</Button>
          </ModalClose>
          <Button variant="danger">取り消す</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
  play: async ({ canvasElement }) => {
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
    expect(dialog.querySelector('[data-slot="modal-header"] svg')).not.toBeNull();
  },
};

/** Figma "Auto": the width follows the content (still capped by the viewport). */
export const AutoSize: Story = {
  render: () => (
    <Modal>
      <ModalTrigger asChild>
        <Button variant="primary">Open auto-size modal</Button>
      </ModalTrigger>
      <ModalContent size="auto">
        <ModalHeader>
          <ModalTitle>保存しました</ModalTitle>
        </ModalHeader>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="primary">OK</Button>
          </ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
};
