import { useState } from 'react';
import {
  Icon
  // , JsonView 
} from '../components';
import { GlobalSearch, type SearchResult } from '../search';
import { useDriveSync } from '../sync/DriveSyncContext';
import { LanguageSwitcher, localizeErrorMessage, useI18n, type TranslationKey } from '../i18n';
import type { AppDocument, SyncStatus } from '../types';

interface SyncPanelProps {
  document: AppDocument | null;
  isDbAvailable: boolean;
  /** Called when the user picks a search result; App reveals + navigates to it. */
  onSearchNavigate: (result: SearchResult) => void;
}

const STATUS_LABEL_KEYS: Record<SyncStatus, TranslationKey> = {
  'local-only': 'sync.localOnly',
  connecting: 'sync.connecting',
  syncing: 'sync.syncing',
  synced: 'sync.synced',
  offline: 'sync.offline',
  'reauth-required': 'sync.reconnect',
  error: 'sync.failed',
};

const STATUS_CLASS_NAMES = {
  'local-only': 'state-local-only',
  connecting: 'state-signing-in',
  syncing: 'state-syncing',
  synced: 'state-synced',
  offline: 'state-local-only',
  'reauth-required': 'state-signed-out',
  error: 'state-sync-failed',
} as const;

export const SyncPanel = ({ document, isDbAvailable, onSearchNavigate }: SyncPanelProps) => {
  const { t } = useI18n();
  const {
    status,
    errorMessage,
    currentUser,
    isConnected,
    connect,
    syncNow,
    logout,
  } = useDriveSync();
  const [isLogoutPending, setIsLogoutPending] = useState(false);

  const isBusy = status === 'connecting' || status === 'syncing' || isLogoutPending;
  const needsReconnect = isConnected && status === 'reauth-required';

  const canRetrySync =
    isConnected && (status === 'offline' || status === 'error');

  // const canShowAutoSync =
  //   isConnected && (status === 'synced' || status === 'syncing');

  const handleConnect = () => {
    void connect();
  };

  const handleRetrySync = () => {
    void syncNow();
  };

  const handleLogout = async () => {
    setIsLogoutPending(true);
    try {
      await logout();
    } finally {
      setIsLogoutPending(false);
    }
  };

  return (
    <div className="sync-panel">
      <div className="sync-status" aria-live="polite">
        <span className={`status-badge ${STATUS_CLASS_NAMES[status]}`}>{t(STATUS_LABEL_KEYS[status])}</span>


        {document?.syncMetadata.lastSyncedAt && (
          <span className="timestamp">
            {new Date(document.syncMetadata.lastSyncedAt).toLocaleTimeString()}
          </span>
        )}
        {currentUser?.emailAddress && <span className="status-badge state-synced">{currentUser.emailAddress?.slice(0, 3)}</span>}
      </div>

      <div className="sync-controls">
        {!isConnected && (
          <button
            className="btn btn-primary"
            onClick={handleConnect}
            disabled={isBusy}
            type="button"
            title={t('sync.connectTitle')}
          >
            <Icon name="ri-plug-line" />
          </button>
        )}

        <GlobalSearch document={document} onNavigate={onSearchNavigate} />

        <LanguageSwitcher />

        {needsReconnect && (
          <button
            className="btn btn-primary"
            onClick={handleConnect}
            disabled={isBusy}
            type="button"
            title={t('sync.connectTitle')}
          >
            <Icon name="ri-refresh-line" />
          </button>
        )}

        {canRetrySync && (
          <button
            className="btn btn-primary"
            onClick={handleRetrySync}
            disabled={isBusy}
            type="button"
            title={t('sync.retryTitle')}
          >
            <Icon name="ri-refresh-line" />
          </button>
        )}

        {status === 'offline' && isConnected && (
          <span className="auto-sync-indicator">
            <Icon name="ri-cloud-off-line" />
          </span>
        )}

        {/* {canShowAutoSync && (
          <span className="auto-sync-indicator">
            <Icon name="ri-checkbox-circle-fill" /> Auto-sync enabled
          </span>
        )} */}

        {isConnected && (
          <button
            className="btn btn-outline"
            onClick={handleLogout}
            disabled={
              isBusy ||
              status === 'offline' ||
              status === 'reauth-required' ||
              status === 'error'
            }
            type="button"
            title={t('sync.logoutTitle')}
          >
            <Icon name="ri-logout-box-line" />
          </button>
        )}
      </div>

      {errorMessage && <div className="db-alert">{localizeErrorMessage(t, errorMessage)}</div>}

      {!isDbAvailable && (
        <div className="db-alert">
          <Icon name="ri-alert-line" /> {t('sync.indexedDbUnavailable')}
        </div>
      )}
      {/* {currentUser?.emailAddress === 'vsp4994@gmail.com' && document && (
        <div className="debug-json-panel">
          <div className="debug-json-header">
            <Icon name="ri-code-box-line" /> Debug JSON
            <span className="debug-json-user">{currentUser.emailAddress}</span>
          </div>
          <JsonView data={document} />
        </div>
      )} */}
    </div>
  );
};
