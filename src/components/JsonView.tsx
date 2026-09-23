import React, { useState } from 'react';

interface JsonNodeProps {
  label?: string;
  value: unknown;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const primitiveToString = (value: unknown): string => {
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  return String(value);
};

const JsonNode: React.FC<JsonNodeProps> = ({ label, value }) => {
  const [collapsed, setCollapsed] = useState(true);

  if (Array.isArray(value)) {
    const canCollapse = value.length > 0;

    return (
      <div className="json-node json-node-container">
        <button
          type="button"
          className={`json-toggle ${canCollapse ? '' : 'json-toggle-empty'}`}
          onClick={() => canCollapse && setCollapsed((c) => !c)}
        >
          <span className="json-label">{label !== undefined ? `${label}: ` : ''}</span>
          {canCollapse ? (
            <span className="json-caret">{collapsed ? '▸' : '▾'}</span>
          ) : (
            <span className="json-caret json-caret-empty" />
          )}
          <span className="json-bracket">[</span>
          {collapsed ? (
            <span className="json-ellipsis">…</span>
          ) : (
            <>
              <span className="json-bracket">]</span>
              <span className="json-count"> {value.length} item{value.length === 1 ? '' : 's'}</span>
            </>
          )}
        </button>
        {!collapsed && (
          <div className="json-children">
            {value.map((child, index) => (
              <JsonNode key={index} label={String(index)} value={child} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (isPlainObject(value)) {
    const keys = Object.keys(value);
    const canCollapse = keys.length > 0;

    return (
      <div className="json-node json-node-container">
        <button
          type="button"
          className={`json-toggle ${canCollapse ? '' : 'json-toggle-empty'}`}
          onClick={() => canCollapse && setCollapsed((c) => !c)}
        >
          <span className="json-label">{label !== undefined ? `${label}: ` : ''}</span>
          {canCollapse ? (
            <span className="json-caret">{collapsed ? '▸' : '▾'}</span>
          ) : (
            <span className="json-caret json-caret-empty" />
          )}
          <span className="json-bracket">{'{'}</span>
          {collapsed ? (
            <span className="json-ellipsis">…</span>
          ) : (
            <>
              <span className="json-bracket">{'}'}</span>
              <span className="json-count"> {keys.length} key{keys.length === 1 ? '' : 's'}</span>
            </>
          )}
        </button>
        {!collapsed && (
          <div className="json-children">
            {keys.map((key) => (
              <JsonNode key={key} label={key} value={value[key]} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const className =
    value === null ? 'json-null' : typeof value === 'number' ? 'json-number' : typeof value === 'boolean' ? 'json-boolean' : 'json-string';

  return (
    <div className="json-node json-leaf">
      {label !== undefined && <span className="json-label">{label}: </span>}
      <span className={className}>{primitiveToString(value)}</span>
    </div>
  );
};

interface JsonViewProps {
  data: unknown;
}

export const JsonView: React.FC<JsonViewProps> = ({ data }) => {
  return (
    <div className="json-viewer">
      <JsonNode value={data} />
    </div>
  );
};
