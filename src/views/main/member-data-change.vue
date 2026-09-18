<template>
  <div class="member-data-change-page"><router-view /></div>
</template>

<style lang="scss">
.member-data-change-page {
  min-height: 100%;
  padding: 32px;
  background: #f5f7fa;
  .change-header { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 24px; }
  .change-header h1 { color: $text-primary; margin: 4px 0 8px; font-size: 28px; }
  .change-header p { color: $text-light; margin: 0; line-height: 1.6; }
  .change-eyebrow { color: $primary; font-size: 13px; font-weight: 700; }
  .change-card { background: #fff; border: 1px solid #e6ebf1; border-radius: 14px; padding: 24px; margin-bottom: 20px; box-shadow: 0 5px 18px rgba(26,82,118,.05); }
  .change-card h2 { color: $text-primary; font-size: 18px; margin: 0 0 18px; }
  .change-filter, .change-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
  .change-filter { margin-bottom: 20px; }
  .change-actions { justify-content: flex-end; margin-top: 24px; }
  .change-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 0 22px; }
  .change-wide { grid-column: 1 / -1; }
  .change-meta { display: flex; gap: 14px 28px; flex-wrap: wrap; color: $text-light; font-size: 14px; margin-bottom: 18px; }
  .change-notice { margin-bottom: 20px; }
  .change-pagination { margin-top: 22px; justify-content: center; }
  .change-text { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.7; }
  .change-upload { width: 100%; }
  .change-upload p { margin: 8px 0 0; color: $text-light; font-size: 12px; }
  .change-files { display: flex; flex-direction: column; gap: 10px; }
  .change-file { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; padding: 10px 12px; border: 1px solid #e6ebf1; border-radius: 8px; }
  .change-file small { color: $text-light; }
  .change-file-replace { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 14px; }
  .change-file-replace small { width: 100%; color: $text-light; }
  .change-comparison { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .change-comparison th, .change-comparison td { padding: 14px; border: 1px solid #e6ebf1; text-align: left; vertical-align: top; overflow-wrap: anywhere; }
  .change-comparison th { background: #f5f8fb; font-weight: 600; }
  .change-comparison th:first-child { width: 100px; }
  .change-comparison .is-changed { background: #f0f9eb; }
  .change-data { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 18px; margin: 0; }
  .change-data dt { color: $text-light; font-size: 13px; margin-bottom: 6px; }
  .change-data dd { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
  @media (max-width: 680px) {
    padding: 18px 12px;
    .change-header { align-items: flex-start; flex-direction: column; }
    .change-header h1 { font-size: 24px; }
    .change-card { padding: 18px 14px; }
    .change-grid, .change-data { grid-template-columns: 1fr; }
    .change-comparison th:first-child { width: 58px; }
    .change-comparison th, .change-comparison td { padding: 8px; font-size: 13px; }
  }
}
</style>
