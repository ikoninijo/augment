import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Paper,
  Box,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CropSquare as RectangleIcon,
  RadioButtonUnchecked as CircleIcon,
  Remove as LineIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { Stage, Layer, Rect, Circle, Line } from 'react-konva';

const CADEditor = () => {
  const { projectId, drawingId } = useParams();
  const navigate = useNavigate();
  const [tool, setTool] = useState('select');
  const [elements, setElements] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState(null);
  const stageRef = useRef();

  const handleMouseDown = (e) => {
    if (tool === 'select') return;

    const pos = e.target.getStage().getPointerPosition();
    const newElement = {
      id: Date.now(),
      type: tool,
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      points: tool === 'line' ? [pos.x, pos.y, pos.x, pos.y] : undefined
    };

    setCurrentElement(newElement);
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !currentElement) return;

    const pos = e.target.getStage().getPointerPosition();
    
    if (currentElement.type === 'line') {
      setCurrentElement({
        ...currentElement,
        points: [currentElement.points[0], currentElement.points[1], pos.x, pos.y]
      });
    } else {
      setCurrentElement({
        ...currentElement,
        width: pos.x - currentElement.x,
        height: pos.y - currentElement.y
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentElement) return;

    setElements([...elements, currentElement]);
    setCurrentElement(null);
    setIsDrawing(false);
  };

  const renderElement = (element) => {
    const commonProps = {
      key: element.id,
      x: element.x,
      y: element.y,
      stroke: '#2e7d32',
      strokeWidth: 2,
      fill: 'transparent'
    };

    switch (element.type) {
      case 'rectangle':
        return (
          <Rect
            {...commonProps}
            width={element.width}
            height={element.height}
          />
        );
      case 'circle':
        return (
          <Circle
            {...commonProps}
            radius={Math.abs(element.width) / 2}
          />
        );
      case 'line':
        return (
          <Line
            {...commonProps}
            points={element.points}
          />
        );
      default:
        return null;
    }
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving drawing...', elements);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <BackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CAD Editor - Project {projectId} - Drawing {drawingId}
          </Typography>
          <IconButton color="inherit" onClick={handleSave}>
            <SaveIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Toolbar */}
        <Paper sx={{ width: 80, display: 'flex', flexDirection: 'column', p: 1 }}>
          <Tooltip title="Select" placement="right">
            <IconButton
              onClick={() => setTool('select')}
              color={tool === 'select' ? 'primary' : 'default'}
            >
              <BackIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rectangle" placement="right">
            <IconButton
              onClick={() => setTool('rectangle')}
              color={tool === 'rectangle' ? 'primary' : 'default'}
            >
              <RectangleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Circle" placement="right">
            <IconButton
              onClick={() => setTool('circle')}
              color={tool === 'circle' ? 'primary' : 'default'}
            >
              <CircleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Line" placement="right">
            <IconButton
              onClick={() => setTool('line')}
              color={tool === 'line' ? 'primary' : 'default'}
            >
              <LineIcon />
            </IconButton>
          </Tooltip>
        </Paper>

        {/* Canvas */}
        <Box sx={{ flex: 1, backgroundColor: '#fafafa' }}>
          <Stage
            width={window.innerWidth - 80}
            height={window.innerHeight - 64}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            ref={stageRef}
          >
            <Layer>
              {elements.map(renderElement)}
              {currentElement && renderElement(currentElement)}
            </Layer>
          </Stage>
        </Box>
      </Box>
    </Box>
  );
};

export default CADEditor;
