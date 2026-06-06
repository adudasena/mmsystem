package com.adudasena.mmsystem.repository;

import com.adudasena.mmsystem.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    List<Cliente> findByDeletedAtIsNull();
    Optional<Cliente> findByIdAndDeletedAtIsNull(Long id);
}