import { Ref, forwardRef, useImperativeHandle, useState } from 'react'
import './Modal.css'

export interface ModalRef {
    show:()=>void
    hide:()=>void
}
export interface ModalProps {
    children:JSX.Element | JSX.Element[]
    onShow?:() => void
    onHide?:() => void
}

// TODO this should be also feasible without imperativeHandle but with simple params
// otherwise the callbacks onShow, and onHide could be usefull aswell
function _Modal(props:ModalProps,ref:Ref<ModalRef>) {
    const [show, setShow] = useState<boolean>(false)
    const showMe = () => {setShow(true); props.onShow && props.onShow()}
    const hideMe = () => {setShow(false); props.onHide && props.onHide()}
    useImperativeHandle(ref, () => ({
        show: showMe,
        hide: hideMe
    }))
    return (
        <> 
            { show && 
                <div className='modal-background' onClick={()=>hideMe()}>
                    <div className='modal-foreground' onClick={(e)=>e.stopPropagation()}>
                        {props.children}
                    </div>
                </div>
           }
        </>
    )
}
export const Modal = forwardRef(_Modal)