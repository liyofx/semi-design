import React, { ReactNode } from "react";
import { PreviewContext } from "./previewContext";
import BaseComponent from "../_base/baseComponent";
import PropTypes, { array } from "prop-types";
import { PreviewProps, PreviewState } from "./interface";
import PreviewInner from "./previewInner";
import PreviewFoundation from "@douyinfe/semi-foundation/image/previewFoundation";
import { getUuidShort } from "@douyinfe/semi-foundation/utils/uuid";
import { cssClasses } from "@douyinfe/semi-foundation/image/constants";
import { isObject } from "lodash";
import "@douyinfe/semi-foundation/image/image.scss";

const prefixCls = cssClasses.PREFIX;

export default class Preview extends BaseComponent<PreviewProps, PreviewState> {
    static propTypes = {
        style: PropTypes.object,
        className: PropTypes.string,
        visible: PropTypes.bool,
        src: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        currentIndex: PropTypes.number,
        defaultIndex: PropTypes.number,
        defaultVisible: PropTypes.bool,
        maskClosable: PropTypes.bool,
        closable: PropTypes.bool,
        zoomStep: PropTypes.number,
        infinite: PropTypes.bool,
        showTooltip: PropTypes.bool,
        closeOnEsc: PropTypes.bool,
        prevTip: PropTypes.string,
        nextTip: PropTypes.string,
        zoomInTip: PropTypes.string,
        zoomOutTip: PropTypes.string,
        downloadTip: PropTypes.string,
        adaptiveTip: PropTypes.string,
        originTip: PropTypes.string,
        lazyLoad: PropTypes.bool,
        lazyLoadMargin: PropTypes.string,
        preLoad: PropTypes.bool,
        preLoadGap: PropTypes.number,
        disableDownload: PropTypes.bool,
        zIndex: PropTypes.number,
        renderHeader: PropTypes.func,
        renderPreviewMenu: PropTypes.func,
        getPopupContainer: PropTypes.func,
        onVisibleChange: PropTypes.func,
        onChange: PropTypes.func,
        onClose: PropTypes.func,
        onZoomIn: PropTypes.func,
        onZoomOut: PropTypes.func,
        onPrev: PropTypes.func,
        onNext: PropTypes.func,
        onDownload: PropTypes.func,
        onRatioChange: PropTypes.func,
        onRotateChange: PropTypes.func,
    }

    static defaultProps = {
        src: [],
        lazyLoad: true,
        lazyLoadMargin: "0px 100px 100px 0px",
    };

    get adapter() {
        return {
            ...super.adapter,
        };
    }

    foundation: PreviewFoundation;
    previewGroupId: string;
    previewRef: React.RefObject<PreviewInner>;

    constructor(props) {
        super(props);
        this.state = {
            currentIndex: props.currentIndex || props.defaultCurrentIndex || 0,
            visible: props.visible || props.currentDefaultVisible || false,
        };
        this.foundation = new PreviewFoundation(this.adapter);
        this.previewGroupId = getUuidShort({ prefix: "semi-image-preview-group", length: 4 });
        this.previewRef = React.createRef<PreviewInner>();
    }

    componentDidMount() {
        const { lazyLoadMargin } = this.props;
        const allElement = document.querySelectorAll(`.${prefixCls}-img`);
        // use IntersectionObserver to lazy load image
        const observer = new IntersectionObserver(entries => {
            entries.forEach(item => {
                const src = (item.target as any).dataset?.src;
                if (item.isIntersecting && src) {
                    (item.target as any).src = src;
                    observer.unobserve(item.target);
                }
            });
        },
        {
            root: document.querySelector(`#${this.previewGroupId}`),
            rootMargin: lazyLoadMargin, 
        }
        );
        allElement.forEach(item => observer.observe(item));
    }

    static getDerivedStateFromProps(props: PreviewProps, state: PreviewState) {
        const willUpdateStates: Partial<PreviewState> = {};
        if (("currentIndex" in props) && (props.currentIndex !== state.currentIndex)) {
            willUpdateStates.currentIndex = props.currentIndex;
        }
        if (("visible" in props) && (props.visible !== state.visible)) {
            willUpdateStates.visible = props.visible;
        }
        return willUpdateStates;
    }

    handleVisibleChange = (newVisible : boolean) => {
        this.foundation.handleVisibleChange(newVisible);
    };

    handleCurrentIndexChange = (index: number) => {
        this.foundation.handleCurrentIndexChange(index);
    };
    
    loopImageIndex = () => {
        const { children } = this.props;
        let index = 0;
        const srcListInChildren = [];
        const titles: ReactNode [] = [];
        const loop = (children) => {
            return React.Children.map(children, (child) => {
                if (child && child.props && child.type) {
                    if (child.type.isSemiImage) {
                        const { src, preview, alt } = child.props;
                        if (preview) {
                            const previewSrc = isObject(preview) ? ((preview as any).src ?? src) : src;
                            srcListInChildren.push(previewSrc);
                            titles.push(preview?.previewTitle);
                            return React.cloneElement(child, { imageID: index++ });
                        }
                        return child;
                    }
                }
        
                if (child && child.props && child.props.children) {
                    return React.cloneElement(child, {
                        children: loop(child.props.children),
                    });
                }
        
                return child;
            });
        };
        
        return {
            srcListInChildren,
            newChildren: loop(children),
            titles,
        };
    };

    render() {
        const { src, style, lazyLoad, ...restProps } = this.props;
        const { currentIndex, visible } = this.state;
        const { srcListInChildren, newChildren, titles } = this.loopImageIndex();
        const srcArr = Array.isArray(src) ? src : (typeof src === "string" ? [src] : []);
        const finalSrcList = [...srcArr, ...srcListInChildren];
        return (
            <PreviewContext.Provider
                value={{
                    isGroup: finalSrcList.length > 1,
                    previewSrc: finalSrcList,
                    titles: titles,
                    currentIndex,
                    visible,
                    lazyLoad,
                    setCurrentIndex: this.handleCurrentIndexChange,
                    handleVisibleChange: this.handleVisibleChange,
                }}
            >
                <div id={this.previewGroupId} style={style} className={`${prefixCls}-preview-group`}>
                    {newChildren}
                </div>
                <PreviewInner
                    {...restProps}
                    ref={this.previewRef}
                    src={finalSrcList}
                    currentIndex={currentIndex}
                    visible={visible}
                    onVisibleChange={this.handleVisibleChange}
                />
            </PreviewContext.Provider>
        );
    }
}