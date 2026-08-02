import { initCommunityPanel } from './modules/communityPanel.js';
import { initProdMemoPanel } from './modules/prodMemoPanel.js';
import { initSessionPanel } from './modules/sessionPanel.js';
import { initSettingsPanel } from './modules/settingsPanel.js';
import { initEncodedContentPanels } from './modules/encodedContentPanels.js';
import { bindTabs } from './modules/ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    bindTabs();
    initEncodedContentPanels();
    initCommunityPanel();
    await initSettingsPanel();
    await initSessionPanel();
    await initProdMemoPanel();
});
