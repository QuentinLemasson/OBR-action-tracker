export interface InitiativeItem {
    order: number;
    name: string;
    id: string;
    active: boolean;
    visible: boolean;
    maxActions: number;
    actionsLeft: number;
}