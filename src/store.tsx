import { observable } from '@formily/reactive';
import _ from 'lodash';
import { JSX } from 'react';
import { ActivityFC, IResource } from './types';

export const DESIGNER_ICONS_STORE: { value: Record<string, JSX.Element> } =
  observable.ref({});
export const DESIGNER_RESOURCES_STORE: { value: Record<string, IResource> } =
  observable.ref({});

export function registerIcons<T extends string | number | symbol>(icons: {
  [key in T]: JSX.Element;
}) {
  Object.assign(DESIGNER_ICONS_STORE.value, icons);
}

export function getIcon(iconName: string) {
  return DESIGNER_ICONS_STORE.value[iconName];
}

export function registerActivityResources(
  activities: Record<string, ActivityFC<any>>,
) {
  const resourceMap: Record<string, IResource | undefined> = {};
  _.forEach(activities, (activity: ActivityFC<any>, key: string) => {
    resourceMap[activity?.Resource?.componentName || key] = activity?.Resource;
  });
  Object.assign(DESIGNER_RESOURCES_STORE.value, resourceMap);
}

export function getActivityResource(componentName: string): IResource {
  return DESIGNER_RESOURCES_STORE.value[componentName];
}

export function getAddableActivityResources(): {}[] {
  return (
    _.filter(
      _.values(DESIGNER_RESOURCES_STORE.value),
      (resource: IResource) => {
        return resource?.addable;
      },
    ) || []
  );
}

/**
 * 获取条件节点资源
 */
export function getConditionActivityResource(): IResource | undefined {
  return _.find(
    _.values(DESIGNER_RESOURCES_STORE.value),
    (resource: IResource) => {
      return resource?.type === 'CONDITION';
    },
  );
}
