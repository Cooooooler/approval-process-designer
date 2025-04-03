import { define, observable, observe, reaction } from '@formily/reactive';
import Chance from 'chance';
import _ from 'lodash';
import { GlobalStore } from '../store';
import { ApprovalProcessEngine } from './ApprovalProcessEngine';

const chance = new Chance();

export type ProcessNodeType =
  | 'START'
  | 'ROUTE'
  | 'CONDITION'
  | 'APPROVAL'
  | 'CC'
  | 'END';

export interface IProcessNode {
  /**
   * ApprovalProcessEngine实例
   */
  engine: ApprovalProcessEngine;
  /**
   * 节点唯一标识
   */
  id: string;
  type: ProcessNodeType;
  componentName: string;
  /**
   * 条件节点
   */
  conditionNodes: (ProcessNode | undefined)[];
  title: string;
  props: any;
  /**
   * 默认条件
   */
  defaultCondition?: boolean;
  description?: string;
  nextNode?: IProcessNode;
  isSourceNode?: boolean;
}

const ProcessNodes = new Map<string, ProcessNode>();

export class ProcessNode implements IProcessNode {
  componentName: string;
  conditionNodes: (ProcessNode | undefined)[];
  engine: ApprovalProcessEngine;
  id: string;
  props: any;
  title: string;
  type: ProcessNodeType;
  defaultCondition?: boolean;
  description?: string;
  nextNode?: IProcessNode;
  isSourceNode?: boolean;
  /**
   * 上一个节点的id
   */
  prevNodeId?: string;

  constructor(node: IProcessNode, parentNode?: ProcessNode) {
    this.engine = parentNode?.engine ?? node.engine;
    this.isSourceNode = node.isSourceNode;
    this.id =
      node.id ?? `Activity_${chance.string({ length: 10, alpha: true })}`;
    this.type = node.type;
    this.componentName = node.componentName;
    this.prevNodeId = parentNode?.id;
    this.conditionNodes = [];
    this.title = node.title;
    this.description = node.description;
    this.props = node.props;
    this.defaultCondition = node.defaultCondition;

    /**
     * 在每次添加节点时，将节点保存在全局变量中
     * Map<string, ProcessNode>
     */
    ProcessNodes.set(this.id, this);
    this.from(node);
    this.makeObservable();
  }

  makeObservable() {
    define(this, {
      prevNodeId: observable.ref,
      title: observable.ref,
      description: observable.ref,
      nextNode: observable.ref,
      conditionNodes: observable.shallow,
      props: observable,
      defaultCondition: observable.ref,
    });

    reaction(
      () => {
        return (
          (this.prevNodeId ?? '') +
          (this.title ?? '') +
          (this.description ?? '') +
          (this.nextNode?.id ?? '') +
          (this.conditionNodes.length ?? 0)
        );
      },
      () => {
        if (!this.isSourceNode) {
          this.engine?.handleChange(`${this.id} something changed`);
        }
      },
    );

    observe(this.props, () => {
      if (!this.isSourceNode) {
        this.engine?.handleChange(`${this.id} props changed`);
      }
    });
  }

  setNextNode(node: ProcessNode | null) {
    if (!node) {
      this.nextNode = null;
      return;
    }

    node.nextNode = this.nextNode;
    node.prevNodeId = this.id;
    this.nextNode = node;
  }

  setConditionNodes(nodes: (ProcessNode | undefined)[]) {
    if (_.isEmpty(nodes)) {
      return;
    }
    _.forEach(nodes, (node) => {
      if (node instanceof ProcessNode) {
        node.prevNodeId = this.id;
      }
    });
    this.conditionNodes = nodes;
  }

  from(node: IProcessNode) {
    if (node.id !== this.id) {
      ProcessNodes.delete(this.id);
      ProcessNodes.set(node.id, this);
      this.id = node.id;
    }
    this.type = node.type;
    this.componentName = node.componentName || node.type;
    this.title = node.title;
    this.description = node.description;
    this.props = node.props;
    this.engine = node.engine;

    if (node.nextNode) {
      this.nextNode = new ProcessNode(node.nextNode, this);
    }
    if (node.conditionNodes && node.conditionNodes.length > 0) {
      this.conditionNodes =
        node.conditionNodes?.map((node) => {
          return new ProcessNode(node, this);
        }) || [];
    }
  }

  clone(parentNode?: ProcessNode) {
    const node = new ProcessNode(
      {
        type: this.type,
        componentName: this.componentName,
        title: this.title,
        description: this.description,
        props: _.cloneDeep(this.props),
      },
      parentNode,
    );
    if (this.type === 'ROUTE') {
      const conditionResource = GlobalStore.getConditionActivityResource();
      const firstCondition = conditionResource?.node?.clone(node);
      const conditionDefault = conditionResource?.node?.clone(node);
      if (conditionDefault instanceof ProcessNode) {
        conditionDefault.defaultCondition = true;
      }
      node.setConditionNodes([firstCondition, conditionDefault]);
    }
    return node;
  }

  cloneDeep(node?: ProcessNode) {
    if (!node) {
      return;
    }
    const cloneNode = _.cloneDeep(node);
    ProcessNodes.set(cloneNode.id, cloneNode);
    return cloneNode;
  }

  remove() {
    const parentNode = this.prevNodeId
      ? ProcessNodes.get(this.prevNodeId)
      : void 0;
    if (parentNode) {
      if (this.type === 'CONDITION') {
        //当前节点是条件节点
        const linkedIds = this.collectLinkIds();
        if (parentNode.conditionNodes.length > 2) {
          //当分支超过2个时，只需要删除当前节点，否则，清除整个路由节点
          parentNode.conditionNodes = _.filter(
            parentNode.conditionNodes,
            (conditionNode: any) => {
              return conditionNode.id !== this.id;
            },
          );
        } else {
          //只有2个分支的时候，删除当前分支所有链路节点，另一个分支，如果有除了条件节点之外的节点，则保留，否则，清除整个路由节点
          const parentParentNode = parentNode.prevNodeId
            ? ProcessNodes.get(parentNode.prevNodeId)
            : void 0; //条件节点的父节点是路由节点，如果清除整个路由，需要找到父节点的父节点
          const parentNodeNextNode = parentNode.nextNode;
          parentParentNode?.setNextNode(null); //这里要断开节点链，否则可能造成递归渲染

          linkedIds.push(parentNode.id);
          const remainNode = _.find(
            parentNode.conditionNodes,
            (conditionNode: any) => {
              return conditionNode.id !== this.id;
            },
          );
          const { deleteIds, startNode, endNode } =
            this.processRaminRouteBranch(remainNode);
          if (deleteIds) {
            linkedIds.push(...deleteIds);
          }
          if (startNode) {
            parentParentNode?.setNextNode(startNode);
            endNode?.setNextNode(parentNodeNextNode);
          } else {
            parentParentNode?.setNextNode(parentNodeNextNode);
          }
        }
        _.forEach(linkedIds, (id: string) => {
          ProcessNodes.delete(id);
        });
      } else {
        if (this.nextNode) {
          this.nextNode.prevNodeId = this.prevNodeId;
        }
        parentNode.nextNode = this.nextNode;
        ProcessNodes.delete(this.id);
      }
    }
  }

  /**
   * 添加条件分支
   */
  addConditionBranch() {
    if (this.type !== 'ROUTE') {
      return;
    }
    const conditionActivity =
      GlobalStore.getConditionActivityResource()?.node?.clone(this);
    if (conditionActivity) {
      const newChildren = _.concat(
        this.conditionNodes.slice(0, this.conditionNodes.length - 1),
        conditionActivity,
        this.conditionNodes.slice(this.conditionNodes.length - 1),
      );
      this.setConditionNodes(newChildren);
    }
  }

  /**
   * 获取下面链路上的所有节点id
   */
  collectLinkIds() {
    let ids: string[] = [];
    if (this.nextNode) {
      ids.push(this.nextNode.id);
      ids = ids.concat(this.nextNode.collectLinkIds());
    }
    if (this.conditionNodes && this.conditionNodes.length > 0) {
      this.conditionNodes.forEach((child) => {
        if (child) {
          ids.push(child.id);
          ids = ids.concat(child.collectLinkIds());
        }
      });
    }
    return ids;
  }

  /**
   * 处理剩下的分支(default branch)，删除条件节点，保留其他节点
   * @param node
   */
  processRaminRouteBranch = (
    node?: ProcessNode,
  ): {
    deleteIds?: string[];
    startNode?: ProcessNode | null;
    endNode?: ProcessNode | null;
  } => {
    const ids: string[] = [];
    const getStartNode = (node?: null | ProcessNode) => {
      if (!node) {
        return null;
      }
      let startNode = node;
      while (startNode?.type === 'CONDITION' && startNode.nextNode) {
        ids.push(startNode.id);
        startNode = startNode.nextNode;
      }
      return startNode;
    };

    const getEndNode = (node?: null | ProcessNode) => {
      if (!node) {
        return null;
      }
      let endNode = node;
      while (endNode?.nextNode) {
        endNode = endNode.nextNode;
      }
      return endNode;
    };
    const startNode = getStartNode(node);
    const endNode = getEndNode(startNode);
    return {
      deleteIds: ids,
      startNode: startNode,
      endNode: endNode,
    };
  };

  get index() {
    if (this.type === 'CONDITION' && this.prevNodeId) {
      const parentNode = ProcessNodes.get(this.prevNodeId);
      if (parentNode) {
        return parentNode.conditionNodes?.indexOf(this) || 0;
      }
    }
    return null;
  }

  isFirst() {
    if (this.type !== 'CONDITION') {
      return false;
    }
    return this.index === 0;
  }

  isLast() {
    if (this.type !== 'CONDITION') {
      return false;
    }
    if (this.prevNodeId) {
      const parentNode = ProcessNodes.get(this.prevNodeId);
      return this.index === (parentNode?.conditionNodes?.length || 0) - 1;
    }
    return false;
  }
}
