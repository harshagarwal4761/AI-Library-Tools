package com.aitoolshub.service;

import com.aitoolshub.dto.ToolRequest;
import com.aitoolshub.dto.ToolResponse;
import com.aitoolshub.entity.Tool;
import com.aitoolshub.entity.User;
import com.aitoolshub.repository.ToolRepository;
import com.aitoolshub.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ToolService {

    private final ToolRepository toolRepository;
    private final UserRepository userRepository;

    public ToolService(ToolRepository toolRepository, UserRepository userRepository) {
        this.toolRepository = toolRepository;
        this.userRepository = userRepository;
    }

    public ToolResponse addTool(ToolRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Tool tool = new Tool(request.getName(), request.getUrl(), request.getTag(), user);
        tool = toolRepository.save(tool);

        return new ToolResponse(tool.getId(), tool.getName(), tool.getUrl(), tool.getTag());
    }

    public List<ToolResponse> getToolsByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return toolRepository.findByUserId(user.getId())
                .stream()
                .map(tool -> new ToolResponse(tool.getId(), tool.getName(), tool.getUrl(), tool.getTag()))
                .collect(Collectors.toList());
    }

    public List<ToolResponse> getToolsByUserAndTag(String username, String tag) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return toolRepository.findByUserIdAndTag(user.getId(), tag)
                .stream()
                .map(tool -> new ToolResponse(tool.getId(), tool.getName(), tool.getUrl(), tool.getTag()))
                .collect(Collectors.toList());
    }

    public void deleteTool(Long toolId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Tool tool = toolRepository.findById(toolId)
                .orElseThrow(() -> new RuntimeException("Tool not found"));

        if (!tool.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this tool");
        }

        toolRepository.delete(tool);
    }
}
