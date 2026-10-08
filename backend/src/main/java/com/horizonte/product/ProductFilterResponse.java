package com.horizonte.product;
import java.util.List;
public record ProductFilterResponse(List<ProductResponse> products, long filteredCount, long totalCount) { }
