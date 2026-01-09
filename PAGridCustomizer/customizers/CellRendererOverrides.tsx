import { Label, IconButton, Stack } from '@fluentui/react';
import * as React from 'react';
import { CellRendererOverrides } from '../types';

export const cellRendererOverrides: CellRendererOverrides = {
    ["Text"]: (props, col) => {
        // Render all text cells in green font
        return <Label style={{ color: 'green' }}>{props.formattedValue}</Label>
    },
    ["Currency"]: (props, col) => {
        // Only override the cell renderer for the CreditLimit column
        if (col.colDefs[col.columnIndex].name === 'creditlimit') {
            // Render the cell value in green when the value is blue than $100,000 and red otherwise
            if ((props.value as number) > 100000) {
                return <Label style={{ color: 'blue' }}>{props.formattedValue}</Label>
            }
            else {
                return <Label style={{ color: 'red' }}>{props.formattedValue}</Label>
            }
        }
    },
    
    ["TextArea"]: (props, col) => {
        const htmlContent = props.value as string || '';
        
        // Handle click to open editor
        const handleEditClick = (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            if (props.startEditing && props.columnEditable) {
                props.startEditing(props.value);
            }
        };

        return (
            <Stack 
                horizontal 
                verticalAlign="center" 
                tokens={{ childrenGap: 8 }}
                styles={{ 
                    root: { 
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        position: 'relative'
                    } 
                }}
            >
                {/* HTML content preview */}
                <Stack.Item 
                    grow 
                    styles={{ 
                        root: { 
                            overflow: 'hidden',
                            maxHeight: props.rowHeight || 32,
                            flex: 1
                        } 
                    }}
                >
                    <div
                        style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            fontSize: '12px',
                            lineHeight: '1.4'
                        }}
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                </Stack.Item>
                
                {/* Edit button - only show if column is editable */}
                {props.columnEditable && (
                    <Stack.Item>
                        <IconButton
                            iconProps={{ iconName: 'Edit' }}
                            title="Edit rich text content"
                            ariaLabel="Edit"
                            onClick={handleEditClick}
                            styles={{ 
                                root: { 
                                    height: 24, 
                                    width: 24,
                                    minWidth: 24
                                } 
                            }}
                        />
                    </Stack.Item>
                )}
            </Stack>
        );
    }
}
