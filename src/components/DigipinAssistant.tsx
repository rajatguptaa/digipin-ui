import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
  Tooltip,
  Divider,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ReplayIcon from "@mui/icons-material/Replay";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { askDigipinAgent } from "../services/digipinAgent";

type AgentRole = "user" | "assistant" | "error";

interface AgentMessage {
  id: string;
  role: AgentRole;
  content: string;
  timestamp: Date;
}

const initialPrompt = `Ask anything about DIGIPIN.
Examples:
- Validate a DIGIPIN and explain its approx location
- Convert coordinates to DIGIPIN with steps
- Compare two DIGIPINs and find the distance
- Pick the nearest DIGIPIN out of a list`;

const DigipinAssistant: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = (message: AgentMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const content = input.trim();
    const userMessage: AgentMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };
    addMessage(userMessage);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const response = await askDigipinAgent(content);
      const assistantMessage: AgentMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
      };
      addMessage(assistantMessage);
    } catch (err: any) {
      const message =
        err instanceof Error ? err.message : "Unable to reach DIGIPIN agent.";
      setError(message);
      addMessage({
        id: `error-${Date.now()}`,
        role: "error",
        content: message,
        timestamp: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setError(null);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content).catch(() => {});
  };

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        border: "1px solid rgba(100, 181, 246, 0.2)",
        p: 3,
        minHeight: 420,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h6" sx={{ color: "#64b5f6", fontWeight: 600 }}>
            DIGIPIN AI Assistant
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gemini-powered agent with DIGIPIN tools.
          </Typography>
        </Box>
        <Tooltip title="Clear conversation">
          <span>
            <IconButton onClick={resetConversation} disabled={loading || messages.length === 0}>
              <ReplayIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {!messages.length && (
        <Alert severity="info" sx={{ backgroundColor: "rgba(100, 181, 246, 0.1)" }}>
          {initialPrompt}
        </Alert>
      )}

      {!!messages.length && (
        <List
          dense
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            borderRadius: 1,
            border: "1px solid rgba(100, 181, 246, 0.15)",
            backgroundColor: "rgba(20, 20, 20, 0.6)",
          }}
        >
          {messages.map((msg, idx) => (
            <React.Fragment key={msg.id}>
              <ListItem
                alignItems="flex-start"
                sx={{
                  flexDirection: "column",
                  alignItems: "stretch",
                  gap: 1,
                  py: 1.5,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color:
                        msg.role === "assistant"
                          ? "#81c784"
                          : msg.role === "error"
                          ? "#ef5350"
                          : "#64b5f6",
                    }}
                  >
                    {msg.role === "assistant"
                      ? "Assistant"
                      : msg.role === "error"
                      ? "Error"
                      : "You"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {msg.timestamp.toLocaleTimeString()}
                  </Typography>
                </Box>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "pre-wrap",
                        color: msg.role === "error" ? "#ef9a9a" : "#ffffff",
                      }}
                    >
                      {msg.content}
                    </Typography>
                  }
                />
                {msg.role === "assistant" && (
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Tooltip title="Copy response">
                      <IconButton onClick={() => handleCopy(msg.content)} size="small">
                        <ContentCopyIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </ListItem>
              {idx < messages.length - 1 && (
                <Divider component="li" sx={{ borderColor: "rgba(100, 181, 246, 0.08)" }} />
              )}
            </React.Fragment>
          ))}
        </List>
      )}

      {error && (
        <Alert severity="error" sx={{ backgroundColor: "rgba(239, 83, 80, 0.1)" }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 1 }}>
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about DIGIPIN codes, routes, validation..."
          fullWidth
          multiline
          minRows={2}
          maxRows={4}
          disabled={loading}
        />
        <Tooltip title="Send">
          <span>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !input.trim()}
              sx={{ alignSelf: "flex-end", minHeight: 48 }}
              endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            >
              {loading ? "Sending" : "Send"}
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default DigipinAssistant;
