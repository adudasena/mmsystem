package com.adudasena.mmsystem.repository;

import com.adudasena.mmsystem.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByTelefone(String telefone);
    // findByTelefone já vai ser útil quando fizer o login da vitrine
}