import { useAuth0 } from "@auth0/auth0-react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    useColorModeValue,
} from "@chakra-ui/react";
import { menus } from "./mockups";

import { MenuItem as SettingMenuItem } from "./MenuItem";
import { useLocation } from "react-router-dom";
import { useCallback, useMemo } from "react";
import { LogoutMenuItem } from "./LogoutMenuItem";
import { DeleteAccountMenuItem } from "./DeleteAccountMenuItem";

function SettingMenuMobile() {
    const borderColor = useColorModeValue("#E8ECEF", "neutral.70");
    const location = useLocation();
    const { user } = useAuth0();
    const iconFillColor = useColorModeValue(undefined, "#FEFEFE");

    const getFilteredMenus = useCallback(() => {
        const isUniversalUser = () => user?.sub?.startsWith("auth0|");
        if (isUniversalUser()) return menus;
        return menus.filter((menu) => menu.title !== "Password");
    }, [user?.sub]);

    const activeMenu = useMemo(
        () =>
            getFilteredMenus().find((menu) => {
                return location.pathname.includes(menu.route);
            }),
        [getFilteredMenus, location.pathname]
    );

    function renderIcon() {
        const LeftIcon = activeMenu?.icon;
        if (!LeftIcon) return null;
        return <LeftIcon fill={iconFillColor} />;
    }

    return (
        <Menu matchWidth={false}>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} width="full" className="mobile-dropdown-action-btn"
                mb="24px"
            >
                {renderIcon()}
                {activeMenu?.title ?? "Actions"}
            </MenuButton>
            <MenuList>
                {getFilteredMenus().map((menu) => (
                    <MenuItem as={Box} _focus={{ bg: "transparent" }}>
                        <SettingMenuItem
                            key={menu.route}
                            {...menu}
                            borderColor="transparent"
                        />
                    </MenuItem>
                ))}
                <MenuItem>
                    <Box
                        pt="3"
                        borderTopWidth="1px"
                        borderStyle="solid"
                        borderColor={borderColor}
                        width="full"
                    >
                        <LogoutMenuItem />
                    </Box>
                </MenuItem>
                <MenuItem>
                    <DeleteAccountMenuItem />
                </MenuItem>
            </MenuList>
        </Menu>
    );
}

export default SettingMenuMobile;
