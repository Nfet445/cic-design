# 58 — A helper that waits on an option, not on the list

Status: done
Wave: 9
Blocked by: —

## Problem

`packages/core/src/Typeahead/BaseTypeahead.menu.test.tsx` went red for four
cases of `closing a dialog that a pick opened, in a field with focus entries`
after tickets 54 and 55 landed, and the failing case rotated between runs.

The helper `openDialogFromPick()` clicked the combobox, awaited
`findByRole('option', {name: 'Apple', hidden: true})` and pressed `Enter`. The
rows mount while the layer still reports the list closed
(`aria-expanded="false"`), and jsdom has no UA rule that hides a closed
popover — `[popover]:not(:popover-open) {display: none}` exists in a browser
only. So an option in the tree is not proof that the list is open, and `Enter`
on a still-closed list only opens it: the highlight appears, no pick happens,
and the awaited dialog never arrives.

## Fix

The helper now awaits `aria-expanded="true"` before it looks for the option.
That is the component's own signal that the list is open. Three runs of the
file pass 32/32.

## Rule for later helpers

A test helper that opens a layer and then acts on a row must wait for the
layer's open signal (`aria-expanded`, or the dialog role) before it queries
the row. An option that exists while `aria-expanded` is false belongs to a
closed layer that a browser hides and jsdom does not.
