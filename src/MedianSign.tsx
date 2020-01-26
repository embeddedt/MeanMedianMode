import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

const MedianSign = (props) => {
    return <Draggable draggableId={"MEDIAN_SIGN"} index={0} type="BUILDING">
        {(provided, snapshot) => (
        )}
    </Draggable>;
};
export default MedianSign;