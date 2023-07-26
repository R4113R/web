import { AppBar, LinearProgress, Box } from '@mui/material';
import AppContext from '../../context/AppContext';
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import TrackTabList from './tabs/TrackTabList';
import WeatherTabList from './tabs/WeatherTabList';
import FavoritesTabList from './tabs/FavoritesTabList';
import _ from 'lodash';
import PoiTabList from './tabs/PoiTabList';

export default function InformationBlock({
    mobile,
    setDrawerWidth,
    hideContextMenu,
    showContextMenu,
    setShowContextMenu,
    setClearState,
    resizing,
    setResizing,
    setDrawerHeight,
    drawerHeight,
}) {
    const DRAWER_SIZE = 400;

    const ctx = useContext(AppContext);

    const [value, setValue] = useState('general');
    const [tabsObj, setTabsObj] = useState(null);
    const [prevTrack, setPrevTrack] = useState(null);

    /**
     * Handle Escape key to close PointContextMenu.
     * Located here (parent) to run Effect on closed menu.
     * Otherwise (if located in child) we can't catch removeEventListener moment.
     */
    const escapePointMenu = useCallback((e) => {
        if (e.key === 'Escape') {
            ctx.setPointContextMenu({});
        }
    }, []);
    useEffect(() => {
        window.removeEventListener('keydown', escapePointMenu);
        if (!_.isEmpty(ctx.pointContextMenu)) {
            window.addEventListener('keydown', escapePointMenu);
        }
    }, [ctx.pointContextMenu]);

    useEffect(() => {
        if (!showContextMenu) {
            stopCreatedTrack(false);
            ctx.setShowPoints({ points: true, wpts: true });
            ctx.setTrackRange(null);
            setClearState(true);
            ctx.setCurrentObjectType(null);
            if (setDrawerHeight) {
                setDrawerHeight(0);
            }
        }
    }, [showContextMenu]);

    useEffect(() => {
        if (ctx.currentObjectType !== ctx.OBJECT_TYPE_LOCAL_CLIENT_TRACK && ctx.createTrack) {
            stopCreatedTrack(true);
        }
    }, [ctx.currentObjectType]);

    useEffect(() => {
        if (
            (!ctx.selectedGpxFile || _.isEmpty(ctx.selectedGpxFile)) &&
            ctx.currentObjectType !== ctx.OBJECT_TYPE_WEATHER
        ) {
            setPrevTrack(null);
            setTabsObj(null);
            setShowContextMenu(false);
        } else {
            if (!ctx.currentObjectType) {
                setTabsObj(null);
                setShowContextMenu(false);
            } else if (ctx.updateContextMenu || !prevTrack || Object.keys(prevTrack).length === 0 || !showContextMenu) {
                let obj;
                setPrevTrack(ctx.selectedGpxFile);
                ctx.setUpdateContextMenu(false);
                if (ctx.currentObjectType === ctx.OBJECT_TYPE_CLOUD_TRACK && ctx.selectedGpxFile?.tracks) {
                    obj = new TrackTabList().create(ctx, setShowContextMenu);
                } else if (ctx.currentObjectType === ctx.OBJECT_TYPE_WEATHER && ctx.weatherPoint) {
                    obj = new WeatherTabList().create(ctx);
                } else if (ctx.currentObjectType === ctx.OBJECT_TYPE_FAVORITE) {
                    obj = new FavoritesTabList().create(ctx);
                } else if (ctx.currentObjectType === ctx.OBJECT_TYPE_POI) {
                    obj = new PoiTabList().create();
                } else if (ctx.selectedGpxFile) {
                    obj = new TrackTabList().create(ctx, setShowContextMenu);
                }
                if (obj) {
                    setShowContextMenu(true);
                    clearStateIfObjChange();
                    setTabsObj(obj);
                    setValue(obj.defaultTab);
                    if (setDrawerHeight) {
                        setDrawerHeight(50);
                    }
                }
            }
        }
    }, [ctx.currentObjectType, ctx.selectedGpxFile, ctx.weatherPoint, ctx.updateContextMenu]);

    useEffect(() => {
        getWidth();
    });

    function clearStateIfObjChange() {
        if (
            prevTrack &&
            prevTrack.name !== ctx.selectedGpxFile.name &&
            prevTrack.points?.length !== ctx.selectedGpxFile?.points?.length
        ) {
            setClearState(true);
        } else {
            setClearState(false);
        }
    }

    function stopCreatedTrack(deletePrev) {
        if (ctx.createTrack) {
            ctx.createTrack.enable = false;
            if (deletePrev) {
                ctx.createTrack.deletePrev = deletePrev;
            }
            ctx.setCreateTrack({ ...ctx.createTrack });
            ctx.addFavorite.editTrack = false;
            ctx.setAddFavorite({ ...ctx.addFavorite });
        }
    }

    function showInfoBlock() {
        return mobile ? true : !hideContextMenu;
    }

    function getWidth() {
        let currentWidth;
        if (showContextMenu && showInfoBlock()) {
            currentWidth = mobile ? 'auto' : `${DRAWER_SIZE}px`;
        } else {
            currentWidth = '0px';
        }
        setDrawerWidth(currentWidth);
        return currentWidth;
    }

    return (
        <>
            {showContextMenu && showInfoBlock() && (
                <>
                    <Box anchor={'right'} sx={{ alignContent: 'flex-end', height: `auto`, width: `${getWidth()}` }}>
                        <div>
                            {(ctx.loadingContextMenu || ctx.gpxLoading) && <LinearProgress size={20} />}
                            {tabsObj &&
                                tabsObj.tabList.length > 0 &&
                                (mobile ? (
                                    <TabContext value={value}>
                                        <AppBar position="static" color="default">
                                            <div>
                                                <TabList
                                                    onTouchStart={() => {
                                                        setResizing(true);
                                                    }}
                                                    onTouchEnd={() => {
                                                        setResizing(false);
                                                    }}
                                                    onTouchMove={(e) => {
                                                        if (!resizing) {
                                                            return;
                                                        }
                                                        let offsetTop =
                                                            document.body.offsetHeight - e.changedTouches[0].clientY;
                                                        let minHeight = 50;
                                                        let maxHeight = 600;
                                                        if (offsetTop < minHeight) {
                                                            setDrawerHeight(minHeight);
                                                        } else if (offsetTop > maxHeight) {
                                                            setDrawerHeight(maxHeight);
                                                        } else {
                                                            setDrawerHeight(offsetTop);
                                                        }
                                                    }}
                                                    onMouseDown={() => {
                                                        setResizing(true);
                                                    }}
                                                    onMouseUp={() => {
                                                        setResizing(false);
                                                    }}
                                                    onMouseMove={(e) => {
                                                        if (!resizing) {
                                                            return;
                                                        }
                                                        let offsetTop = document.body.offsetHeight - e.clientY;
                                                        let minHeight = 50;
                                                        let maxHeight = 600;
                                                        if (offsetTop + minHeight / 2 < minHeight) {
                                                            setDrawerHeight(minHeight);
                                                        } else if (offsetTop + minHeight / 2 > maxHeight) {
                                                            setDrawerHeight(maxHeight);
                                                        } else {
                                                            setDrawerHeight(offsetTop + minHeight / 2);
                                                        }
                                                    }}
                                                    variant="scrollable"
                                                    scrollButtons
                                                    allowScrollButtonsMobile
                                                    onChange={(e, newValue) => setValue(newValue)}
                                                >
                                                    {tabsObj.tabList}
                                                </TabList>
                                            </div>
                                        </AppBar>
                                        <div style={{ height: `${drawerHeight}px`, overflowX: 'auto' }}>
                                            {Object.values(tabsObj.tabs).map((item) => (
                                                <TabPanel
                                                    sx={{ paddingBottom: '70px' }}
                                                    value={item.key + ''}
                                                    key={'tabpanel:' + item.key}
                                                >
                                                    {item}
                                                </TabPanel>
                                            ))}
                                        </div>
                                    </TabContext>
                                ) : (
                                    <TabContext value={value}>
                                        <AppBar position="static" color="default">
                                            <div>
                                                <TabList
                                                    variant="scrollable"
                                                    scrollButtons
                                                    onChange={(e, newValue) => setValue(newValue)}
                                                >
                                                    {tabsObj.tabList}
                                                </TabList>
                                            </div>
                                        </AppBar>
                                        <div>
                                            {Object.values(tabsObj.tabs).map((item) => (
                                                <TabPanel value={item.key + ''} key={'tabpanel:' + item.key}>
                                                    {item}
                                                </TabPanel>
                                            ))}
                                        </div>
                                    </TabContext>
                                ))}
                        </div>
                    </Box>
                </>
            )}
        </>
    );
}
