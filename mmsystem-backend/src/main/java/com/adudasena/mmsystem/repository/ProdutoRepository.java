package com.adudasena.mmsystem.repository;

import com.adudasena.mmsystem.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    List<Produto> findByDeletedAtIsNull();
    Optional<Produto> findByIdAndDeletedAtIsNull(Long id);
}