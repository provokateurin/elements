import { Classes, Intent, Popover, PopoverInteractionKind, Tag } from '@blueprintjs/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { safeStringify } from '@stoplight/json';
import { JsonSchemaViewer, ViewMode } from '@stoplight/json-schema-viewer';
import { CLASSNAMES } from '@stoplight/markdown-viewer';
import { Dictionary, NodeType } from '@stoplight/types';
import { CodeViewer } from '@stoplight/ui-kit/CodeViewer';
import { SimpleTab, SimpleTabList, SimpleTabPanel, SimpleTabs } from '@stoplight/ui-kit/SimpleTabs';
import cn from 'classnames';
import { JSONSchema4 } from 'json-schema';
import { isEmpty, map } from 'lodash';
import * as React from 'react';

import { NodeTypeColors, NodeTypeIconDefs } from '../constants';
import { useInlineRefResolver } from '../context/InlineRefResolver';
import { JSONSchema } from '../types';
import { MarkdownViewer } from './MarkdownViewer';

export interface ISchemaViewerProps {
  schema: JSONSchema;
  title?: string;
  description?: string;
  errors?: string[];
  examples?: Dictionary<string>;
  className?: string;
  forceShowTabs?: boolean;
  viewMode?: ViewMode;
}

export const SchemaAndExamples = ({
  className,
  title,
  description,
  schema,
  examples,
  errors,
  viewMode,
  forceShowTabs,
}: ISchemaViewerProps) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const resolveRef = useInlineRefResolver();

  const JSV = ({ jsvClassName }: { jsvClassName?: string }) => {
    return (
      <>
        <SchemaTitle title={title} errors={errors} />

        {description && <MarkdownViewer markdown={description} />}

        <JsonSchemaViewer
          resolveRef={resolveRef}
          className={jsvClassName}
          schema={schema as JSONSchema4}
          viewMode={viewMode}
        />
      </>
    );
  };

  if (isEmpty(examples) && !forceShowTabs) {
    return <JSV jsvClassName={cn(className, 'dark:border-gray-9', CLASSNAMES.bordered, CLASSNAMES.block)} />;
  }

  return (
    <SimpleTabs
      className={cn('SchemaViewer', className)}
      selectedIndex={selectedIndex}
      onSelect={setSelectedIndex}
      forceRenderTabPanel
    >
      <SimpleTabList>
        <SimpleTab>Schema</SimpleTab>

        {map(examples, (_, key) => (
          <SimpleTab key={key}>{key === 'default' ? 'Example' : key}</SimpleTab>
        ))}
      </SimpleTabList>

      <SimpleTabPanel className="p-0">{<JSV />}</SimpleTabPanel>

      {map(examples, (example, key) => {
        return (
          <SimpleTabPanel key={key} className="p-0">
            <CodeViewer
              language="json"
              showLineNumbers
              className="py-4 px-4 overflow-auto max-h-400px"
              value={safeStringify(example, undefined, 2) || ''}
            />
          </SimpleTabPanel>
        );
      })}
    </SimpleTabs>
  );
};

const SchemaTitle = ({ title, errors }: { title?: string; errors?: string[] }) => {
  const hasErrors = errors && errors.length;
  if (!title && !hasErrors) {
    return null;
  }

  return (
    <div className={cn('MV_block_header flex items-center p-2')} style={{ height: 30 }}>
      {title && (
        <div className="flex items-center flex-1">
          <FontAwesomeIcon icon={NodeTypeIconDefs[NodeType.Model]} color={NodeTypeColors[NodeType.Model]} />
          <div className={cn(Classes.TEXT_MUTED, 'px-2')} style={{ fontSize: 12 }}>
            {title}
          </div>
        </div>
      )}

      <div className="flex-1" />

      {errors && <Errors errors={errors} />}
    </div>
  );
};

const Errors = ({ errors }: { errors: string[] }) => {
  if (!errors || !errors.length) {
    return null;
  }

  return (
    <Popover
      interactionKind={PopoverInteractionKind.HOVER}
      target={
        <Tag intent={Intent.DANGER}>
          {errors.length} Error{errors.length > 1 && 's'}
        </Tag>
      }
      content={
        <div
          className={cn('p-6 max-w-md break-all', {
            'list-none': errors.length === 1,
          })}
        >
          {errors.map((error, index) => {
            return (
              <li key={index} className={index > 1 ? 'mt-3' : ''}>
                {error}
              </li>
            );
          })}
        </div>
      }
    />
  );
};