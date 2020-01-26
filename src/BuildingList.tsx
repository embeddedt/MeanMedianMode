import React from 'react';
import Building, { LogicalBuilding } from './Building';
import { Droppable, Draggable, DraggableStateSnapshot } from 'react-beautiful-dnd';

function getStyle(style, snapshot: DraggableStateSnapshot) {
    const isModeBox = snapshot.draggingOver != null && snapshot.draggingOver.startsWith("MODE");
    if (!snapshot.isDropAnimating || !isModeBox) {
      return style;
    }
    return {
      ...style,
      // cannot be 0, but make it super tiny
      transitionDuration: `0.0001s`,
      visibility: 'hidden'
    };
}

export default class BuildingList extends React.Component<{ getList: (id: string) => LogicalBuilding[]; onBuildingClick?: (index: number) => void; buildingPointer?: boolean; draggingDisabled?: boolean; }> {
    buildingContainerRef: HTMLDivElement;
    constructor(props) {
        super(props);
    }
    onBuildingClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if(!this.props.draggingDisabled)
            return;
        if(typeof this.props.onBuildingClick == 'function')
            this.props.onBuildingClick(parseInt(e.currentTarget.getAttribute("data-game-index"), 10));
    };
    /*<div className="building-wrapper"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    style={style}
                                >*/
    render() {
        return <Droppable droppableId="buildingList" direction="horizontal" type="BUILDING">
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    className="buildings"
                    {...provided.droppableProps}
                >
                    {this.props.getList("buildingList").map((val, index) => (
                        <Draggable key={val.id} draggableId={val.id} index={index} isDragDisabled={this.props.draggingDisabled} type="BUILDING">
                            {(provided, snapshot) => {
                                const style = getStyle(provided.draggableProps.style, snapshot);
                                return <div className="building-wrapper"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    style={style}
                                >
                                    <Building
                                        onClick={this.onBuildingClick}
                                        data-game-index={index} {...val}
                                        buildingPointer={this.props.buildingPointer}
                                        {...provided.dragHandleProps}
                                        className={`${snapshot.isDragging ? "building-dragging" : ""} ${snapshot.isDropAnimating && snapshot.draggingOver?.startsWith("MODE") ? "building-stick-top" : ""}`}/>
                                </div>;
                            }}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>;
    }
}