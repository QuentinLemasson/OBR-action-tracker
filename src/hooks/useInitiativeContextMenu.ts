import { useEffect } from "react";
import addIcon from "../assets/add.svg";
import removeIcon from "../assets/remove.svg";
import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../functions/getPluginId";

export const useInitiativeContextMenu = () => {
    useEffect(() => {
        OBR.contextMenu.create({
          icons: [
            {
              icon: addIcon,
              label: "Add to Initiative",
              filter: {
                every: [
                  { key: "layer", value: "CHARACTER", coordinator: "||" },
                  { key: "layer", value: "MOUNT" },
                  { key: "type", value: "IMAGE" },
                  { key: ["metadata", getPluginId("metadata")], value: undefined },
                ],
                permissions: ["UPDATE"],
              },
            },
            {
              icon: removeIcon,
              label: "Remove from Initiative",
              filter: {
                every: [
                  { key: "layer", value: "CHARACTER", coordinator: "||" },
                  { key: "layer", value: "MOUNT" },
                  { key: "type", value: "IMAGE" },
                ],
                permissions: ["UPDATE"],
              },
            },
          ],
          id: getPluginId("menu/toggle"),
          onClick(context) {
            OBR.scene.items.updateItems(context.items, (items) => {
              // Check whether to add the items to initiative or remove them
              const addToInitiative = items.every(
                (item) => item.metadata[getPluginId("metadata")] === undefined
              );

              for (let item of items) {
                if (addToInitiative) {
                  item.metadata[getPluginId("metadata")] = {
                    order: 0,
                    active: false,
                    maxActions: 4,
                    actionsLeft: 4,
                  };
                } else {
                  delete item.metadata[getPluginId("metadata")];
                }
              }
            });
          },
        });
      }, []);
}