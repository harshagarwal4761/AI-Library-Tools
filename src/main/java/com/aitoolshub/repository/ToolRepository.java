package com.aitoolshub.repository;

import com.aitoolshub.entity.Tool;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ToolRepository extends JpaRepository<Tool, Long> {
    List<Tool> findByUserId(Long userId);
    List<Tool> findByUserIdAndTag(Long userId, String tag);
}
