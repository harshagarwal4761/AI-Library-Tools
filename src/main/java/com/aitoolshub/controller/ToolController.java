package com.aitoolshub.controller;

import com.aitoolshub.dto.ToolRequest;
import com.aitoolshub.dto.ToolResponse;
import com.aitoolshub.service.ToolService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tools")
public class ToolController {

    private final ToolService toolService;

    public ToolController(ToolService toolService) {
        this.toolService = toolService;
    }

    @GetMapping
    public ResponseEntity<List<ToolResponse>> getTools(Authentication authentication) {
        List<ToolResponse> tools = toolService.getToolsByUser(authentication.getName());
        return ResponseEntity.ok(tools);
    }

    @PostMapping
    public ResponseEntity<ToolResponse> addTool(@Valid @RequestBody ToolRequest request,
                                                 Authentication authentication) {
        ToolResponse tool = toolService.addTool(request, authentication.getName());
        return ResponseEntity.ok(tool);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTool(@PathVariable Long id, Authentication authentication) {
        try {
            toolService.deleteTool(id, authentication.getName());
            return ResponseEntity.ok(Map.of("message", "Tool deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
