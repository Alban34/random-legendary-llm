let myludoImportStatus = $state('idle');
let myludoImportError = $state('');
let myludoImportSummary = $state(null);
let bggImportStatus = $state('idle');
let bggImportError = $state('');
let bggImportSummary = $state(null);

export function getMyludoImportStatus() { return myludoImportStatus; }
export function setMyludoImportStatus(v) { myludoImportStatus = v; }
export function getMyludoImportError() { return myludoImportError; }
export function setMyludoImportError(v) { myludoImportError = v; }
export function getMyludoImportSummary() { return myludoImportSummary; }
export function setMyludoImportSummary(v) { myludoImportSummary = v; }
export function getBggImportStatus() { return bggImportStatus; }
export function setBggImportStatus(v) { bggImportStatus = v; }
export function getBggImportError() { return bggImportError; }
export function setBggImportError(v) { bggImportError = v; }
export function getBggImportSummary() { return bggImportSummary; }
export function setBggImportSummary(v) { bggImportSummary = v; }
