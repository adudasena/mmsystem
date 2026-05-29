package com.adudasena.mmsystem.repository;

import com.adudasena.mmsystem.model.Condicional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional; // Verifique esta importação
import java.util.List;

@Repository
public interface CondicionalRepository extends JpaRepository<Condicional, Long> {

    List<Condicional> findByStatus(String status);
    List<Condicional> findByClienteId(Long clienteId);

    // --- ADICIONE ESTE BLOCO EXATO ABAIXO ---
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM itens_condicional WHERE fk_produto_id = ?1", nativeQuery = true)
    void deletarItensPorProdutoId(Long produtoId);
}