package com.travelhub.batch;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Lưu trữ tạm danh sách các dòng dữ liệu lỗi bị Spring Batch Skip theo từng runId,
 * đảm bảo an toàn khi nhiều Admin cùng upload file CSV song song.
 */
@Component
public class BatchErrorCollector {

    private final Map<String, List<String>> errorStore = new ConcurrentHashMap<>();

    public void init(String runId) {
        errorStore.put(runId, Collections.synchronizedList(new ArrayList<>()));
    }

    public void addError(String runId, String message) {
        if (runId == null) {
            return;
        }
        errorStore.computeIfAbsent(runId, k -> Collections.synchronizedList(new ArrayList<>()))
                .add(message);
    }

    public List<String> consumeErrors(String runId) {
        if (runId == null) {
            return Collections.emptyList();
        }
        List<String> errors = errorStore.remove(runId);
        return errors != null ? errors : Collections.emptyList();
    }
}
