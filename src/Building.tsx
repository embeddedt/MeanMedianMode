import React from 'react';
import { Droppable } from 'react-beautiful-dnd';

export interface LogicalBuilding {
    id: string;
    height: number;
    color: string;
}

export function getSortedHeightsOfBuildingList(buildingList: LogicalBuilding[]) {
    return [...new Set(buildingList.map(val => val.height))].sort((a, b) => a - b);
}
const Building = React.forwardRef<HTMLDivElement, Omit<LogicalBuilding, "id">&React.HTMLProps<HTMLDivElement>&{buildingPointer?: boolean; }>((props, ref) => {
    const chunks = [];
    for(var i = 0; i < Math.round(props.height/10); i++) {
        chunks.push(<div className="building-chunk" key={i}></div>);
    }
    let { height, className, id, buildingPointer, color, style, ...rest } = props;
    style = { ...style, backgroundColor: color };
    if(typeof className == 'undefined')
        className = "";
    return <div className={`building ${className} ${buildingPointer ? "building-clickable" : ""}`} ref={ref} style={style} {...rest}>
        {chunks}
        <span className="height-label noselect">{height} m</span>
    </div>;
});
export default Building;