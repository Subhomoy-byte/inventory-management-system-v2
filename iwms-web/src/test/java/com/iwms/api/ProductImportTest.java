package com.iwms.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Product Batch Import & Kaggle Ingestion Tests")
class ProductImportTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String loginAndGetToken(String username, String password) throws Exception {
        String loginJson = String.format("{\"username\":\"%s\",\"password\":\"%s\"}", username, password);
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
        return response.get("token").asText();
    }

    @Test
    @DisplayName("POST /api/products/import: Rejects unauthenticated request with 401")
    void testImportUnauthorized() throws Exception {
        mockMvc.perform(post("/api/products/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/products/import: Rejects employee role with 403 Forbidden")
    void testImportForbiddenForEmployee() throws Exception {
        String employeeToken = loginAndGetToken("employee", "employee123");
        String payload = "[{\"sku\":\"KAG-TEST-001\",\"name\":\"Test Item\",\"category\":\"STANDARD\",\"sellingPrice\":25.0}]";

        mockMvc.perform(post("/api/products/import")
                        .header("Authorization", "Bearer " + employeeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/products/import: Allows admin to import batch and provisions warehouse bin")
    void testImportSuccessForAdmin() throws Exception {
        String adminToken = loginAndGetToken("admin", "admin123");
        String payload = """
                [
                    {
                        "sku": "KAG-TEST-001",
                        "name": "Kaggle Industrial Sensor M12",
                        "category": "ELECTRONICS",
                        "sellingPrice": 45.0,
                        "costPrice": 22.0,
                        "reorderPoint": 15,
                        "quantity": 80,
                        "binLocation": "BIN-C1-99"
                    },
                    {
                        "sku": "KAG-TEST-002",
                        "name": "Kaggle Organic Fresh Milk 2L",
                        "category": "PERISHABLE",
                        "sellingPrice": 4.50,
                        "costPrice": 2.10,
                        "reorderPoint": 20,
                        "quantity": 100,
                        "binLocation": "BIN-B1-99"
                    }
                ]
                """;

        MvcResult result = mockMvc.perform(post("/api/products/import")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
        assertEquals(2, response.get("importedCount").asInt());

        // Verify product was registered and can be retrieved
        mockMvc.perform(get("/api/products/KAG-TEST-001")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("KAG-TEST-001"))
                .andExpect(jsonPath("$.name").value("Kaggle Industrial Sensor M12"))
                .andExpect(jsonPath("$.category").value("ELECTRONICS"));
    }
}
