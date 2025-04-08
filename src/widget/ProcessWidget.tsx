import styled from '@emotion/styled';
import { registerActivityResources } from 'approval-process-designer';
import React, { FC, useEffect } from 'react';
import { EndActivity } from '../activity';
import { ActivitiesContext } from '../context';
import { useProcess } from '../hooks/useProcess';
import { IActivities } from '../types';
import { ActivityWidget } from './ActivityWidget';

const ProcessWidgetStyled = styled('div')({
  background: '#F0F2F5',
  paddingTop: 20,
  paddingBottom: 20,
  minWidth: 'min-content',
});

type ProcessWidgetProps = {
  activities?: IActivities;
};
export const ProcessWidget: FC<ProcessWidgetProps> = ({ activities }) => {
  const processNode = useProcess();

  useEffect(() => {
    if (activities) {
      registerActivityResources(activities);
    }
  }, [activities]);

  return (
    <ActivitiesContext.Provider value={activities}>
      <ProcessWidgetStyled className={`process-widget`}>
        {processNode && (
          <ActivityWidget processNode={processNode}></ActivityWidget>
        )}
        <EndActivity />
      </ProcessWidgetStyled>
    </ActivitiesContext.Provider>
  );
};
