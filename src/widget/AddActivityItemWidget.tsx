import styled from '@emotion/styled';
import { getActivityResource, getIcon } from 'approval-process-designer';
import React, { FC } from 'react';
import { ProcessNode } from '../model';
import { IResource } from '../types';
import { IconWidget } from './IconWidget';

const ActivityCardWidgetStyled = styled('div')({
  cursor: 'pointer',
  color: 'black',
  display: 'flex',
  alignItems: 'center',
  minWidth: '0px',
  width: '100%',
  height: '50px',
  padding: '10px',
  boxSizing: 'border-box',
  background: 'rgba(17, 31, 44, 0.02)',
  gap: '8px',
  [`&:hover`]: {
    background: '#FFFFFF',
    border: '1px solid #ecedef',
    boxShadow: '0 2px 8px 0 rgba(17, 31, 44, 0.08)',
  },
  '.activity-icon': {
    fontSize: '28px',
  },
});

type ActivityCardWidgetProps = {
  resource: IResource;
  processNode: ProcessNode;
  onClick: (processNode: ProcessNode) => void;
};
export const AddActivityItemWidget: FC<ActivityCardWidgetProps> = ({
  resource,
  processNode,
  onClick,
}) => {
  const handleClick = () => {
    onClick?.(processNode);
    const activity = getActivityResource(resource?.componentName);
    processNode.setNextNode(activity?.node.clone(processNode));
  };
  return (
    <ActivityCardWidgetStyled onClick={handleClick}>
      <IconWidget className={`activity-icon`} icon={getIcon(resource?.icon)} />
      <div className={`title`}>{resource?.title}</div>
    </ActivityCardWidgetStyled>
  );
};
