package com.adudasena.mmsystem.repository;

import com.adudasena.mmsystem.model.Condicional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CondicionalRepository extends JpaRepository<Condicional, Long> {
    List<Condicional> findByStatus(String status);
    List<Condicional> findByClienteId(Long clienteId); // Ajustado para corresponder ao ID do cliente
}