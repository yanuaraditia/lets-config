/**
 * Setup file: register happy-dom globals before React client tests run.
 * Loaded via bunfig.toml preload.
 */
import { GlobalRegistrator } from '@happy-dom/global-registrator'

GlobalRegistrator.register()
