// src/app/import-vm.svelte.ts
// Svelte 5 reactive view-model for the Import tab (BGG and MyLudo imports).

import type { BggMatchResult, MyludoMatchResult } from './types.ts';

export type ImportStatus = 'idle' | 'loading' | 'success' | 'error';

let myludoImportStatus: ImportStatus = $state<ImportStatus>('idle');
let myludoImportError: string = $state<string>('');
let myludoImportSummary: MyludoMatchResult | null = $state<MyludoMatchResult | null>(null);
let bggImportStatus: ImportStatus = $state<ImportStatus>('idle');
let bggImportError: string = $state<string>('');
let bggImportSummary: BggMatchResult | null = $state<BggMatchResult | null>(null);

export function getMyludoImportStatus(): ImportStatus { return myludoImportStatus; }
export function setMyludoImportStatus(v: ImportStatus): void { myludoImportStatus = v; }
export function getMyludoImportError(): string { return myludoImportError; }
export function setMyludoImportError(v: string): void { myludoImportError = v; }
export function getMyludoImportSummary(): MyludoMatchResult | null { return myludoImportSummary; }
export function setMyludoImportSummary(v: MyludoMatchResult | null): void { myludoImportSummary = v; }
export function getBggImportStatus(): ImportStatus { return bggImportStatus; }
export function setBggImportStatus(v: ImportStatus): void { bggImportStatus = v; }
export function getBggImportError(): string { return bggImportError; }
export function setBggImportError(v: string): void { bggImportError = v; }
export function getBggImportSummary(): BggMatchResult | null { return bggImportSummary; }
export function setBggImportSummary(v: BggMatchResult | null): void { bggImportSummary = v; }
