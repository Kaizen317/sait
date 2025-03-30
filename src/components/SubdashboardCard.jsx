import React from "react";
import {
  Typography,
  IconButton,
  Card,
  Box,
  Chip,
  alpha,
} from "@mui/material";
import {
  Edit,
  Delete,
  ArrowBackIosNew,
  ArrowForwardIos,
} from "@mui/icons-material";

const SubdashboardCard = ({ 
  subdashboard, 
  index, 
  isActive, 
  componentsCount, 
  onSelect, 
  onEdit, 
  onDelete, 
  onMoveLeft, 
  onMoveRight 
}) => {
  return (
    <Card
      onClick={() => onSelect(subdashboard)}
      sx={{
        cursor: "pointer",
        width: { xs: "100%", sm: "220px", md: "220px" },
        minHeight: "150px", // Increased height for better spacing
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "flex-start",
        p: 2,
        borderRadius: "16px",
        transition: "all 0.3s ease",
        background: isActive
          ? "linear-gradient(135deg, #006875 0%, #00a6b4 100%)"
          : "linear-gradient(135deg, #334155 0%, #475569 100%)",
        boxShadow: isActive
          ? "0 10px 25px rgba(0, 166, 180, 0.4)"
          : "0 6px 12px rgba(0,0,0,0.15)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: isActive
            ? "0 12px 28px rgba(0, 166, 180, 0.45)"
            : "0 10px 20px rgba(0,0,0,0.2)",
        },
        position: "relative", // For positioning the navigation indicators
      }}
    >
      {/* Position indicators */}
      {index > 0 && (
        <Box 
          sx={{ 
            position: "absolute", 
            top: "50%", 
            left: -8, 
            transform: "translateY(-50%)",
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: alpha("#fff", 0.7),
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: 0.6,
            transition: "opacity 0.2s ease",
            "&:hover": { opacity: 1 }
          }}
        />
      )}
      
      {/* Encabezado e iconos de edición/eliminación */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start", // Changed from center for better spacing
          mb: 2, // Increased margin
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: { xs: "1rem", sm: "1.1rem" },
            fontWeight: 600,
            color: "#fff",
            maxWidth: "70%", // Limit width to prevent overflow
            wordBreak: "break-word",
          }}
        >
          {subdashboard.name}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onEdit(index);
            }}
            size="small"
            sx={{
              color: "#fff",
              backgroundColor: "rgba(255,255,255,0.15)",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onDelete(index);
            }}
            size="small"
            sx={{
              color: "white",
              backgroundColor: "rgba(255,255,255,0.15)",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Contador de componentes */}
      <Chip
        label={`${componentsCount} componentes`}
        size="small"
        sx={{
          backgroundColor: "rgba(255,255,255,0.2)",
          color: "#fff",
          fontSize: "0.75rem",
          fontWeight: 500,
          border: "1px solid rgba(255,255,255,0.2)",
          mb: 2, // Add margin at bottom
        }}
      />

      {/* Navigation buttons in a more visible location */}
      <Box 
        sx={{ 
          display: "flex", 
          width: "100%", 
          justifyContent: "space-between",
          mt: "auto"
        }}
      >
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onMoveLeft(index);
          }}
          disabled={index === 0}
          size="small"
          sx={{
            color: "white",
            backgroundColor: index === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)",
            "&:hover": { 
              backgroundColor: index === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.25)" 
            },
            opacity: index === 0 ? 0.5 : 1,
          }}
        >
          <ArrowBackIosNew fontSize="small" />
        </IconButton>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onMoveRight(index);
          }}
          size="small"
          sx={{
            color: "white",
            backgroundColor: "rgba(255,255,255,0.15)",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
          }}
        >
          <ArrowForwardIos fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
};

export default SubdashboardCard;
