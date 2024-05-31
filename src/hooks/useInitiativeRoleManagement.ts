import OBR, { Player } from "@owlbear-rodeo/sdk";
import { Dispatch, SetStateAction, useEffect } from "react";

export const useInitiativeRoleManagement = (setRole : Dispatch<SetStateAction<"GM" | "PLAYER">>) => {
    useEffect(() => {
        const handlePlayerChange = (player: Player) => {
          setRole(player.role);
        };
        OBR.player.getRole().then(role => setRole(role));
        return OBR.player.onChange(handlePlayerChange);
      }, []);
}