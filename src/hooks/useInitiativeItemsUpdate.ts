import OBR, { Item, isImage } from "@owlbear-rodeo/sdk";
import { useEffect } from "react";
import { InitiativeItem } from "../types/InitiativeItem";
import { getPluginId } from "../functions/getPluginId";
import { isMetadata } from "../functions/isMetadata";

export const useInitiativeItemsUpdate = (setInitiativeItems : Function) => {
    // handle the character updates on action popover
    useEffect(() => {
        const handleItemsChange = async (items: Item[]) => {
        const initiativeItems: InitiativeItem[] = [];
        for (const item of items) {
            if (isImage(item)) {
            const metadata = item.metadata[getPluginId("metadata")];
            if (isMetadata(metadata)) {
                initiativeItems.push({
                id: item.id,
                order: metadata.order,
                name: item.text.plainText || item.name,
                active: metadata.active,
                visible: item.visible,
                maxActions: metadata.maxActions,
                actionsLeft: metadata.actionsLeft,
                });
            }
            }
        }
        setInitiativeItems(initiativeItems);
        };

        OBR.scene.items.getItems().then(handleItemsChange);
        return OBR.scene.items.onChange(handleItemsChange);
    }, []);
}