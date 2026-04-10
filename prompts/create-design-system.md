# Role

You are a senior product designer and design systems lead.

# Context

You are creating a design system for this application:

- A browser-based single-page application for the Legendary: Marvel randomizer project
- The product helps users browse game content, manage their collection, generate new games, review history, and manage preferences such as theme and language
- The visual direction should be inspired by the mood, energy, contrast, and atmosphere of `/cover.jpg`

Use the cover image as creative reference only.
Do not copy character art, logos, title treatment, or copyrighted visual elements directly into the proposed UI.
The output must describe an original interface system that feels appropriate for the product.

# Objective

Create a practical design system that developers can implement for the application, then translate that design system into implementation epics and a delivery task list.

# Documentation Outputs

Produce 3 separate markdown documents:

1. `documentation/design-system.md`
- the design-system specification developers will implement

2. `documentation/design-system-epics.md`
- the implementation epics and stories required to deliver that design system

3. `documentation/design-system-task-list.md`
- the implementation checklist for each story from `documentation/design-system-epics.md`

The three documents must be consistent with each other.

# What To Produce

## File 1: `documentation/design-system.md`

Provide a complete design-system proposal with the following sections:

1. Brand direction
- Summarize the visual concept in 3 to 5 sentences
- Describe the emotional tone, visual keywords, and overall product personality

2. Core design principles
- Define 5 to 7 principles that should guide future UI decisions

3. Color system
- Extract the main visual cues from `/cover.jpg`
- Propose an original color palette with named tokens
- Include at minimum:
	- primary
	- secondary
	- accent
	- background
	- surface
	- text primary
	- text secondary
	- success
	- warning
	- danger
	- focus
- For each token, provide a hex value and a short usage note
- Ensure the palette supports accessible contrast for UI text and controls

4. Typography system
- Recommend headline, body, and monospace type directions
- Prefer realistic web-safe or easily available web fonts
- Explain why each choice fits the product
- Define a type scale with suggested sizes, weights, and usage

5. Spacing, shape, and layout
- Define spacing tokens
- Define border radius, stroke, shadow, and panel treatment
- Describe the preferred layout density for desktop and mobile

6. Component style guidance
- Provide styling guidance for the main UI building blocks:
	- app shell
	- top navigation or tab navigation
	- cards and content panels
	- buttons
	- filters and form controls
	- badges and tags
	- alerts and notifications
	- dialogs or confirmations
	- tables or structured lists
- For each component, describe default, hover, focus, disabled, and selected states where relevant

7. Interaction and motion
- Define the motion style in practical terms
- Include recommendations for transitions, hover behavior, focus behavior, and feedback states
- Keep motion subtle, responsive, and suitable for an information-dense app

8. Accessibility guidance
- Specify contrast expectations
- Specify focus treatment requirements
- Note any color-pairing or motion risks to avoid
- Ensure the system remains usable for keyboard and low-vision users

9. Implementation handoff
- Provide a developer-friendly token list that could map cleanly to CSS custom properties
- Include a short example token block using CSS variable naming conventions
- Include specific guidance on how to apply the system consistently across the app

## File 2: `documentation/design-system-epics.md`

Create implementation epics and stories that describe how the design system should be delivered.

Requirements:
- Follow the style used by the existing project planning docs such as `documentation/epics.md`
- Include:
	- a title
	- a short purpose section
	- a quality-gate statement tying completion to the task list file
- Organize the work into clear epics with:
	- `Objective`
	- `In scope`
	- `Stories`
- Keep the epic boundaries practical for implementation
- Cover at minimum:
	- foundations and design tokens
	- typography and color implementation
	- layout and responsive behavior
	- reusable components and states
	- accessibility and focus behavior
	- theme support if appropriate
	- documentation and adoption guidance

## File 3: `documentation/design-system-task-list.md`

Create the implementation checklist for the stories from `documentation/design-system-epics.md`.

Requirements:
- Follow the style used by `documentation/task-list.md`
- Break every story into actionable checkbox tasks
- Include at least:
	- implementation tasks
	- one `Test:` task
	- one `QC:` task
- Ensure each story in the task-list file maps back clearly to a story in the epics file
- Use practical language that a developer can execute without reinterpretation

# Output Requirements

- Be concrete and implementation-ready, not abstract
- Favor decisions over options unless there is a strong reason to present alternatives
- When presenting tokens, use clear names that developers can reuse directly
- Keep the system cohesive and suitable for a modern, polished, game-adjacent productivity interface
- Balance dramatic comic-book energy with readability and usability
- Make the interface feel bold and memorable without becoming noisy or gimmicky
- Keep epic and task language aligned with the documentation conventions already used in this repository
- Do not produce only high-level planning; include enough implementation detail to make the documents actionable

# Deliverable Format

Return the result as 3 separate structured markdown documents with clear section headings and concise bullet points where useful.

# Additional Constraint

If a choice would look visually impressive but harm usability, prefer usability.
