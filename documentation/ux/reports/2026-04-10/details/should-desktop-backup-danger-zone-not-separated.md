## Title
Desktop Backup mixes routine maintenance actions with the most destructive reset path.

## Severity
Should change

## Affects
Desktop

## Source
Senior Desktop UX Auditor

## Where it appears
Backup tab, especially the lower section that combines per-category freshness resets and full reset.

## Evidence
In the live desktop review at `1440x900`, the Backup tab stacks `Backup and restore`, `Used card tracking`, multiple per-category reset buttons, a reset preview sentence, and the `Full Reset - Clear all data` CTA in one continuous management surface. The page does provide a confirmation modal, but the screen itself does not strongly separate everyday maintenance actions from the only action that clears collection, usage, history, and preferences. Active success toasts can also sit over this area, adding more visual competition during sensitive maintenance tasks.

## Why it matters
Routine maintenance and irreversible destruction should not share the same visual weight or scan path. The current layout makes the tab feel operationally dense and asks users to read carefully to avoid crossing from safe upkeep into total data removal.

## Recommended change
Split the desktop Backup experience into three clearer sections: export/import, freshness resets, and a dedicated danger zone. Give the full reset area stronger spacing, a concise consequence summary directly above the button, and a more isolated visual treatment than the routine reset rows. Keep transient toasts from overlapping the danger-zone reading path.

## Expected UX improvement
The Backup screen becomes calmer to use, destructive intent becomes harder to miss, and users can perform routine maintenance with more confidence.
