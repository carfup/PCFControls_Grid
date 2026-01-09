import * as React from 'react';
import { CKEditor } from 'ckeditor4-react';
import { Modal, IconButton, PrimaryButton, Stack } from '@fluentui/react';
import { CellEditorOverrides } from '../types';

// Modal Component for TextArea Rich Text Editor
interface TextAreaEditorModalProps {
  isOpen: boolean;
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  isRequired?: boolean;
}

const TextAreaEditorModal: React.FC<TextAreaEditorModalProps> = ({
  isOpen,
  initialValue,
  onSave,
  onCancel,
  isRequired
}) => {
  const [content, setContent] = React.useState(initialValue || '');
  const [editor, setEditor] = React.useState<any>(null);

  React.useEffect(() => {
    setContent(initialValue || '');
  }, [initialValue]);

  const handleSave = () => {
    // Validate if required
    if (isRequired) {
      const trimmedContent = content.trim();
      // Check for empty content or just empty HTML tags
      if (!trimmedContent || trimmedContent === '<p>&nbsp;</p>' || trimmedContent === '<p></p>' || trimmedContent === '<br>') {
        return; // Don't save if required field is empty
      }
    }
    onSave(content);
  };

  const isContentEmpty = () => {
    if (!isRequired) return false;
    const trimmedContent = content.trim();
    return !trimmedContent || trimmedContent === '<p>&nbsp;</p>' || trimmedContent === '<p></p>' || trimmedContent === '<br>';
  };

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onCancel}
      isBlocking={false}
      styles={{
        main: {
          minWidth: '60vw',
          minHeight: '60vh',
          maxWidth: '90vw',
          maxHeight: '90vh',
          padding: 0
        }
      }}
    >
      <Stack
        tokens={{ childrenGap: 15 }}
        styles={{ root: { padding: 20, height: '100%', display: 'flex', flexDirection: 'column' } }}
      >
        {/* Header */}
        <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
          <Stack.Item styles={{ root: { fontSize: 18, fontWeight: 600 } }}>
            Edit Rich Text Content
            {isRequired && <span style={{ color: 'red', marginLeft: 5 }}>*</span>}
          </Stack.Item>
          <IconButton
            iconProps={{ iconName: 'Cancel' }}
            title="Close"
            ariaLabel="Close"
            onClick={onCancel}
          />
        </Stack>

        {/* CKEditor Content */}
        <Stack.Item grow styles={{ root: { minHeight: 300, overflow: 'hidden' } }}>
          <div style={{ width: '100%', height: '100%' }}>
            <CKEditor
              initData={initialValue || ''}
              config={{
                toolbar: [
                  { name: 'clipboard', items: ['Undo', 'Redo'] },
                  { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike'] },
                  { name: 'paragraph', items: ['BulletedList', 'NumberedList', '-', 'Blockquote'] },
                  { name: 'links', items: ['Link', 'Unlink'] },
                  { name: 'insert', items: ['Table', 'HorizontalRule'] },
                  { name: 'styles', items: ['Format', 'Font', 'FontSize'] },
                  { name: 'colors', items: ['TextColor', 'BGColor'] },
                  { name: 'tools', items: ['Maximize'] },
                  { name: 'document', items: ['Source'] }
                ],
                height: 400,
                resize_enabled: true,
                resize_dir: 'vertical',
                removePlugins: 'elementspath',
                extraPlugins: 'autogrow,sourcedialog',
                autoGrow_minHeight: 200,
                autoGrow_maxHeight: 600,
                autoGrow_onStartup: true,
                removeDialogTabs: 'link:advanced;link:target',
                allowedContent: true, // Allow all HTML tags for full flexibility
                enterMode: 2, // CKEDITOR.ENTER_BR
                shiftEnterMode: 1 // CKEDITOR.ENTER_P
              }}
              onChange={(event: any) => {
                try {
                  const data = event.editor.getData();
                  setContent(data);
                } catch (error) {
                  console.error('CKEditor onChange error:', error);
                }
              }}
              onInstanceReady={(event: any) => {
                setEditor(event.editor);
              }}
              onBeforeLoad={(CKEDITOR: any) => {
                CKEDITOR.disableAutoInline = true;
              }}
              type="classic"
            />
          </div>
        </Stack.Item>

        {/* Footer with buttons */}
        <Stack horizontal tokens={{ childrenGap: 10 }} horizontalAlign="end">
          <PrimaryButton
            text="Save"
            onClick={handleSave}
            disabled={isContentEmpty()}
            title={isContentEmpty() ? 'This field is required' : 'Save changes'}
          />
          <IconButton
            iconProps={{ iconName: 'Cancel' }}
            text="Cancel"
            title="Close without saving"
            onClick={onCancel}
          />
        </Stack>
      </Stack>
    </Modal>
  );
};

// Wrapper component to manage modal state
interface TextAreaEditorWrapperProps {
  initialValue: string;
  onChange: (value: string) => void;
  stopEditing: (cancel?: boolean) => void;
  isRequired?: boolean;
}

const TextAreaEditorWrapper: React.FC<TextAreaEditorWrapperProps> = ({
  initialValue,
  onChange,
  stopEditing,
  isRequired
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(true);

  const handleSave = (newValue: string) => {
    onChange(newValue);
    stopEditing(false); // false = save changes
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    stopEditing(true); // true = cancel changes
    setIsModalOpen(false);
  };

  return (
    <TextAreaEditorModal
      isOpen={isModalOpen}
      initialValue={initialValue}
      onSave={handleSave}
      onCancel={handleCancel}
      isRequired={isRequired}
    />
  );
};

export const cellEditorOverrides: CellEditorOverrides = {
  ["Text"]: (props, col) => {
    // TODO: Add your custom cell editor overrides here
    return null
  },
  
  ["TextArea"]: (props, col) => {
    const onChange = (newValue: string) : void => {     
        col.onCellValueChanged(!newValue ? '' : newValue);      
        col.stopEditing(false); //no rerender without this.
    }
    return (
      <TextAreaEditorWrapper
        initialValue={props.value as string || ''}
        onChange={onChange}
        stopEditing={col.stopEditing}
        isRequired={props.isRequired}
      />
    );
  }
}
